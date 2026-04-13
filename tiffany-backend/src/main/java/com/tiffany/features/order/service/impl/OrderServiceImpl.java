package com.tiffany.features.order.service.impl;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.exception.custom.NotFoundException;
import com.tiffany.exception.custom.ValidationException;
import com.tiffany.features.auth.models.User;
import com.tiffany.features.main.models.Product;
import com.tiffany.features.main.repository.ProductRepository;
import com.tiffany.features.notification.service.TelegramService;
import com.tiffany.features.order.dto.filter.OrderFilterRequest;
import com.tiffany.features.order.dto.helper.OrderCreateHelper;
import com.tiffany.features.order.dto.helper.OrderItemCreateHelper;
import com.tiffany.features.order.dto.request.OrderCreateRequest;
import com.tiffany.features.order.dto.response.OrderResponse;
import com.tiffany.features.order.dto.update.OrderUpdateRequest;
import com.tiffany.features.order.mapper.OrderMapper;
import com.tiffany.features.order.models.Cart;
import com.tiffany.features.order.models.Order;
import com.tiffany.features.order.models.OrderDeliveryAddress;
import com.tiffany.features.order.models.OrderItem;
import com.tiffany.features.order.repository.CartRepository;
import com.tiffany.features.order.repository.OrderDeliveryAddressRepository;
import com.tiffany.features.order.repository.OrderRepository;
import com.tiffany.features.order.service.OrderService;
import com.tiffany.security.SecurityUtils;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.generate.OrderNumberGenerator;
import com.tiffany.shared.mapper.PaginationMapper;
import com.tiffany.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final OrderDeliveryAddressRepository orderDeliveryAddressRepository;
    private final OrderMapper orderMapper;
    private final SecurityUtils securityUtils;
    private final OrderNumberGenerator orderNumberGenerator;
    private final PaginationMapper paginationMapper;
    private final TelegramService telegramService;

    @Override
    public OrderResponse createOrderFromCart(OrderCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Create order from cart - userId: {}", currentUser.getId());

        try {
            Order order = createBaseOrder(request, currentUser.getId());

            OrderStatus status = request.getOrderStatus() != null ? request.getOrderStatus() : OrderStatus.PENDING;
            order.setOrderStatus(status);

            Order savedOrder = orderRepository.save(order);
            log.info("Order created - orderNumber: {}, orderId: {}", savedOrder.getOrderNumber(), savedOrder.getId());

            if (request.getAddressId() != null) {
                OrderDeliveryAddress deliveryAddress = createDeliveryAddressSnapshot(savedOrder.getId(), request.getAddressId());
                if (deliveryAddress != null) {
                    orderDeliveryAddressRepository.save(deliveryAddress);
                }
            }

            Cart cart = cartRepository.findByUserIdWithItems(currentUser.getId())
                    .orElseThrow(() -> new ValidationException("Cart is empty or not found"));

            if (cart.getItems() == null || cart.getItems().isEmpty()) {
                throw new ValidationException("Cannot create order from empty cart");
            }

            log.info("Processing cart items - count: {}", cart.getItems().size());
            createOrderItemsFromCart(savedOrder.getId(), cart);

            clearCartAfterOrder(currentUser.getId());

            OrderResponse response = getOrderById(savedOrder.getId());
            log.info("Order created successfully - orderNumber: {}, itemCount: {}", response.getOrderNumber(), response.getItems().size());

            // Send Telegram notification
            Order fullOrder = orderRepository.findByIdWithDetails(savedOrder.getId()).orElse(null);
            if (fullOrder != null) {
                telegramService.notifyOrderCreated(fullOrder);
            }

            return response;
        } catch (Exception e) {
            log.error("Failed to create order - error: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<OrderResponse> getCustomerOrderHistory(OrderFilterRequest filter) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Get customer order history - userId: {}, page: {}, size: {}, filters: orderStatus={}, paymentMethod={}, paymentStatus={}",
                currentUser.getId(), filter.getPageNo(), filter.getPageSize(), filter.getOrderStatus(), filter.getPaymentMethod(), filter.getPaymentStatus());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Order> page = orderRepository.findCustomerOrdersWithFilters(
                currentUser.getId(),
                filter.getOrderStatus(),
                filter.getPaymentMethod(),
                filter.getPaymentStatus(),
                pageable
        );

        PaginationResponse<OrderResponse> response = orderMapper.toPaginationResponse(page, paginationMapper);
        log.info("Customer orders retrieved - count: {}, total: {}", page.getNumberOfElements(), page.getTotalElements());

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<OrderResponse> getAllOrders(OrderFilterRequest filter) {
        log.info("Get all orders - page: {}, size: {}", filter.getPageNo(), filter.getPageSize());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Order> page = orderRepository.findAllWithFilters(
                filter.getOrderStatus(),
                filter.getPaymentMethod(),
                filter.getPaymentStatus(),
                pageable
        );

        PaginationResponse<OrderResponse> response = orderMapper.toPaginationResponse(page, paginationMapper);
        log.info("Orders retrieved - count: {}, total: {}", page.getNumberOfElements(), page.getTotalElements());

        return response;
    }

    @Override
    public OrderResponse updateOrder(UUID orderId, OrderUpdateRequest request) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (request.getOrderStatus() != null) {
            order.updateStatus(request.getOrderStatus());
        }

        if (request.getPaymentStatus() != null) {
            order.setPaymentStatus(request.getPaymentStatus());
        }

        if (request.getCustomerNote() != null) {
            order.setCustomerNote(request.getCustomerNote());
        }

        Order updatedOrder = orderRepository.save(order);
        log.info("Order updated: {}", orderId);

        // Send Telegram notification for status change
        if (request.getOrderStatus() != null) {
            telegramService.notifyOrderStatusChanged(updatedOrder);
        }

        return orderMapper.toResponse(updatedOrder);
    }

    @Override
    public OrderResponse deleteOrder(UUID orderId) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        order.setIsDeleted(true);
        order = orderRepository.save(order);

        log.info("Order deleted: {}", orderId);

        return orderMapper.toResponse(order);
    }

    private Order createBaseOrder(OrderCreateRequest request, UUID customerId) {
        String orderNumber = orderNumberGenerator.generateOrderNumber();
        OrderCreateHelper helper = orderMapper.buildOrderHelper(request, customerId, orderNumber);
        return orderMapper.createFromHelper(helper);
    }

    private void createOrderItemsFromCart(UUID orderId, Cart cart) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;

        for (var cartItem : cart.getItems()) {
            // Get product for SKU/barcode
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product not found: " + cartItem.getProductId()));

            OrderItemCreateHelper helper = orderMapper.buildOrderItemHelperFromCartItem(cartItem, orderId);

            // Set SKU and barcode from product master data (primary source)
            helper.setSku(product.getSku());
            helper.setBarcode(product.getBarcode());

            OrderItem orderItem = orderMapper.createOrderItemFromHelper(helper);
            orderItem.calculateTotalPrice();

            subtotal = subtotal.add(orderItem.getTotalPrice());
            // Accumulate discount = base price - final price per item * quantity
            BigDecimal itemDiscount = cartItem.getCurrentPrice().subtract(cartItem.getFinalPrice())
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            if (itemDiscount.compareTo(BigDecimal.ZERO) > 0) {
                discountAmount = discountAmount.add(itemDiscount);
            }
        }

        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);

        // Calculate total = subtotal - discount (free shipping, no tax)
        order.setTotalAmount(subtotal.subtract(discountAmount));
        orderRepository.save(order);
    }

    private void clearCartAfterOrder(UUID customerId) {
        cartRepository.findByUserIdAndIsDeletedFalse(customerId)
                .ifPresent(cart -> {
                    if (cart.getItems() != null) {
                        cart.getItems().clear();
                    }
                    log.info("Cart cleared after order for customer: {}", customerId);
                });
    }

    private OrderDeliveryAddress createDeliveryAddressSnapshot(UUID orderId, UUID addressId) {
        try {
            OrderDeliveryAddress deliveryAddress = new OrderDeliveryAddress();
            deliveryAddress.setOrderId(orderId);
            deliveryAddress.setLocationId(addressId);
            log.info("Delivery address snapshot created - orderId: {}", orderId);
            return deliveryAddress;
        } catch (Exception e) {
            log.error("Failed to create delivery address snapshot: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create delivery address snapshot", e);
        }
    }
}
