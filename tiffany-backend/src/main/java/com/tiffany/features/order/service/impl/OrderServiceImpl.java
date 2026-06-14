package com.tiffany.features.order.service.impl;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.exception.custom.NotFoundException;
import com.tiffany.exception.custom.ValidationException;
import com.tiffany.features.auth.models.User;
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
import com.tiffany.features.location.models.Location;
import com.tiffany.features.location.repository.LocationRepository;
import com.tiffany.features.main.models.ProductSize;
import com.tiffany.features.main.repository.ProductSizeRepository;
import com.tiffany.features.order.repository.CartRepository;
import com.tiffany.features.order.repository.OrderDeliveryAddressRepository;
import com.tiffany.features.order.repository.OrderItemRepository;
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
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductSizeRepository productSizeRepository;
    private final CartRepository cartRepository;
    private final OrderDeliveryAddressRepository orderDeliveryAddressRepository;
    private final LocationRepository locationRepository;
    private final OrderMapper orderMapper;
    private final SecurityUtils securityUtils;
    private final OrderNumberGenerator orderNumberGenerator;
    private final PaginationMapper paginationMapper;
    private final TelegramService telegramService;

    @Override
    public OrderResponse createOrderFromCart(OrderCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Creating order from cart: userId={}, addressId={}, paymentBy={}",
                currentUser.getId(), request.getAddressId(), request.getPaymentBy());

        try {
            Order order = createBaseOrder(request, currentUser.getId());

            OrderStatus status = request.getOrderStatus() != null ? request.getOrderStatus() : OrderStatus.PENDING;
            order.setOrderStatus(status);

            Order savedOrder = orderRepository.save(order);
            log.info("Order base saved: orderId={}, orderNumber={}", savedOrder.getId(), savedOrder.getOrderNumber());

            if (request.getAddressId() != null) {
                OrderDeliveryAddress deliveryAddress = createDeliveryAddressSnapshot(savedOrder.getId(), request.getAddressId());
                if (deliveryAddress != null) {
                    orderDeliveryAddressRepository.save(deliveryAddress);
                    log.info("Delivery address snapshot saved: orderId={}, locationId={}",
                            savedOrder.getId(), request.getAddressId());
                }
            }

            Cart cart = cartRepository.findByUserIdWithItems(currentUser.getId())
                    .orElseThrow(() -> new ValidationException("Cart is empty or not found"));

            if (cart.getItems() == null || cart.getItems().isEmpty()) {
                log.warn("Cannot create order from empty cart: userId={}", currentUser.getId());
                throw new ValidationException("Cannot create order from empty cart");
            }

            log.info("Processing cart items: orderId={}, itemCount={}", savedOrder.getId(), cart.getItems().size());
            createOrderItemsFromCart(savedOrder.getId(), cart);

            clearCartAfterOrder(currentUser.getId());

            OrderResponse response = getOrderById(savedOrder.getId());
            log.info("Order created: orderId={}, orderNumber={}, itemCount={}, total={}",
                    savedOrder.getId(), response.getOrderNumber(),
                    response.getItems().size(), response.getTotalAmount());

            UUID notifyOrderId = savedOrder.getId();
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    telegramService.notifyOrderCreated(notifyOrderId);
                }
            });

            return response;
        } catch (Exception e) {
            log.error("Order creation failed: userId={}, error={}", currentUser.getId(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<OrderResponse> getCustomerOrderHistory(OrderFilterRequest filter) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Fetching customer order history: userId={}, page={}, size={}, orderStatus={}, paymentMethod={}",
                currentUser.getId(), filter.getPageNo(), filter.getPageSize(),
                filter.getOrderStatus(), filter.getPaymentMethod());

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
        hydrateOrderItems(page.getContent());

        PaginationResponse<OrderResponse> response = orderMapper.toPaginationResponse(page, paginationMapper);
        log.info("Customer order history fetched: userId={}, count={}, total={}",
                currentUser.getId(), page.getNumberOfElements(), page.getTotalElements());

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        log.info("Fetching order: orderId={}", orderId);

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found: orderId={}", orderId);
                    return new NotFoundException("Order not found");
                });

        log.info("Order fetched: orderId={}, orderNumber={}, status={}", orderId, order.getOrderNumber(), order.getOrderStatus());
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<OrderResponse> getAllOrders(OrderFilterRequest filter) {
        log.info("Fetching all orders (admin): page={}, size={}, orderStatus={}, paymentMethod={}",
                filter.getPageNo(), filter.getPageSize(), filter.getOrderStatus(), filter.getPaymentMethod());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Order> page = orderRepository.findAllWithFilters(
                filter.getOrderStatus(),
                filter.getPaymentMethod(),
                filter.getPaymentStatus(),
                filter.getSearch() != null ? filter.getSearch().trim() : null,
                pageable
        );
        hydrateOrderItems(page.getContent());

        PaginationResponse<OrderResponse> response = orderMapper.toPaginationResponse(page, paginationMapper);
        log.info("All orders fetched: count={}, total={}", page.getNumberOfElements(), page.getTotalElements());

        return response;
    }

    @Override
    public OrderResponse updateOrder(UUID orderId, OrderUpdateRequest request) {
        log.info("Updating order: orderId={}, newStatus={}, newPaymentStatus={}",
                orderId, request.getOrderStatus(), request.getPaymentStatus());

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found for update: orderId={}", orderId);
                    return new NotFoundException("Order not found");
                });

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
        log.info("Order updated: orderId={}, orderNumber={}, status={}", orderId, updatedOrder.getOrderNumber(), updatedOrder.getOrderStatus());

        if (request.getOrderStatus() != null) {
            UUID notifyOrderId = updatedOrder.getId();
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    telegramService.notifyOrderStatusChanged(notifyOrderId);
                }
            });
        }

        return orderMapper.toResponse(updatedOrder);
    }

    @Override
    public OrderResponse deleteOrder(UUID orderId) {
        log.info("Deleting order: orderId={}", orderId);

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found for delete: orderId={}", orderId);
                    return new NotFoundException("Order not found");
                });

        order.setIsDeleted(true);
        order = orderRepository.save(order);

        log.info("Order deleted: orderId={}, orderNumber={}", orderId, order.getOrderNumber());
        return orderMapper.toResponse(order);
    }

    private void hydrateOrderItems(List<Order> orders) {
        if (orders == null || orders.isEmpty()) return;
        List<UUID> orderIds = orders.stream().map(Order::getId).toList();
        orderRepository.fetchItemsForOrders(orderIds);
    }

    private Order createBaseOrder(OrderCreateRequest request, UUID customerId) {
        String orderNumber = orderNumberGenerator.generateOrderNumber();
        log.info("Order number generated: orderNumber={}, customerId={}", orderNumber, customerId);
        OrderCreateHelper helper = orderMapper.buildOrderHelper(request, customerId, orderNumber);
        return orderMapper.createFromHelper(helper);
    }

    private void createOrderItemsFromCart(UUID orderId, Cart cart) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;

        for (var cartItem : cart.getItems()) {
            OrderItemCreateHelper helper = orderMapper.buildOrderItemHelperFromCartItem(cartItem, orderId);

            if (helper.getProductSizeId() == null) {
                ProductSize size = resolveOrCreateStandardSize(cartItem.getProductId(), cartItem.getCurrentPrice());
                helper.setProductSizeId(size.getId());
                helper.setSizeName(size.getName());
            }

            OrderItem orderItem = orderMapper.createOrderItemFromHelper(helper);
            orderItem.calculateTotalPrice();
            orderItemRepository.save(orderItem);

            subtotal = subtotal.add(
                    cartItem.getCurrentPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()))
            );
            BigDecimal itemDiscount = cartItem.getCurrentPrice().subtract(cartItem.getFinalPrice())
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            if (itemDiscount.compareTo(BigDecimal.ZERO) > 0) {
                discountAmount = discountAmount.add(itemDiscount);
            }
        }

        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(subtotal.subtract(discountAmount));
        orderRepository.save(order);

        log.info("Order items created: orderId={}, itemCount={}, subtotal={}, discount={}, total={}",
                orderId, cart.getItems().size(), subtotal, discountAmount, order.getTotalAmount());
    }

    private ProductSize resolveOrCreateStandardSize(UUID productId, BigDecimal price) {
        List<ProductSize> sizes = productSizeRepository.findByProductId(productId);
        if (!sizes.isEmpty()) {
            return sizes.stream()
                    .filter(s -> "Standard".equalsIgnoreCase(s.getName()))
                    .findFirst()
                    .orElse(sizes.get(0));
        }
        ProductSize standard = new ProductSize(productId, "Standard", price);
        ProductSize saved = productSizeRepository.save(standard);
        log.info("Standard size created: productId={}, sizeId={}", productId, saved.getId());
        return saved;
    }

    private void clearCartAfterOrder(UUID customerId) {
        cartRepository.findByUserIdWithItems(customerId)
                .ifPresent(cart -> {
                    int itemCount = cart.getItems() != null ? cart.getItems().size() : 0;
                    cart.clearItems();
                    cartRepository.save(cart);
                    log.info("Cart cleared after order: userId={}, removedItems={}", customerId, itemCount);
                });
    }

    private OrderDeliveryAddress createDeliveryAddressSnapshot(UUID orderId, UUID addressId) {
        Location location = locationRepository.findByIdAndIsDeletedFalse(addressId)
                .orElseThrow(() -> {
                    log.warn("Delivery address not found: locationId={}", addressId);
                    return new NotFoundException("Delivery address not found");
                });

        OrderDeliveryAddress snap = new OrderDeliveryAddress();
        snap.setOrderId(orderId);
        snap.setLocationId(addressId);
        snap.setVillage(location.getVillage());
        snap.setCommune(location.getCommune());
        snap.setDistrict(location.getDistrict());
        snap.setProvince(location.getProvince());
        snap.setStreetNumber(location.getStreetNumber());
        snap.setHouseNumber(location.getHouseNumber());
        snap.setNote(location.getNote());
        snap.setLatitude(location.getLatitude());
        snap.setLongitude(location.getLongitude());

        log.info("Delivery address snapshot built: orderId={}, locationId={}", orderId, addressId);
        return snap;
    }
}
