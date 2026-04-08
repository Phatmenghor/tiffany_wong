package com.tiffany.features.order.service.impl;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.enums.payment.PaymentMethod;
import com.tiffany.enums.payment.PaymentStatus;
import com.tiffany.exception.custom.NotFoundException;
import com.tiffany.exception.custom.ValidationException;
import com.tiffany.features.auth.models.User;
import com.tiffany.features.main.models.Product;
import com.tiffany.features.main.repository.ProductRepository;
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
import com.tiffany.features.order.models.OrderStatusHistory;
import com.tiffany.features.order.repository.CartRepository;
import com.tiffany.features.order.repository.OrderDeliveryAddressRepository;
import com.tiffany.features.order.repository.OrderRepository;
import com.tiffany.features.order.repository.OrderStatusHistoryRepository;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final ProductRepository productRepository;
    private final OrderDeliveryAddressRepository orderDeliveryAddressRepository;
    private final OrderMapper orderMapper;
    private final SecurityUtils securityUtils;
    private final OrderNumberGenerator orderNumberGenerator;
    private final PaginationMapper paginationMapper;

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

            createInitialOrderStatusHistory(savedOrder, currentUser.getId());

            Cart cart = cartRepository.findByUserIdWithItems(currentUser.getId())
                    .orElseThrow(() -> new ValidationException("Cart is empty or not found"));

            if (cart.getItems() == null || cart.getItems().isEmpty()) {
                throw new ValidationException("Cannot create order from empty cart");
            }

            log.info("Processing cart items - count: {}", cart.getItems().size());
            createOrderItemsFromCart(savedOrder.getId(), cart);

            createPaymentRecord(savedOrder);
            clearCartAfterOrder(currentUser.getId());

            OrderResponse response = getOrderById(savedOrder.getId());
            log.info("Order created successfully - orderNumber: {}, itemCount: {}", response.getOrderNumber(), response.getItems().size());
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
        log.info("Get customer order history - userId: {}, page: {}, size: {}",
                currentUser.getId(), filter.getPageNo(), filter.getPageSize());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Order> page = orderRepository.findByCustomerIdAndIsDeletedFalseOrderByCreatedAtDesc(currentUser.getId(), pageable);

        page.getContent().forEach(order -> {
            List<OrderStatusHistory> statusHistory = orderRepository.findStatusHistoryByOrderId(order.getId());
            order.setStatusHistory(statusHistory);
        });

        PaginationResponse<OrderResponse> response = orderMapper.toPaginationResponse(page, paginationMapper);
        log.info("Customer orders retrieved - count: {}, total: {}", page.getNumberOfElements(), page.getTotalElements());

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        // Load statusHistory separately to avoid MultipleBagFetchException
        // This ensures changedByUser is eagerly loaded
        List<OrderStatusHistory> statusHistory = orderRepository.findStatusHistoryByOrderId(orderId);
        order.setStatusHistory(statusHistory);

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

        for (Order order : page.getContent()) {
            List<OrderStatusHistory> statusHistory = orderRepository.findStatusHistoryByOrderId(order.getId());
            order.setStatusHistory(statusHistory);
        }

        PaginationResponse<OrderResponse> response = orderMapper.toPaginationResponse(page, paginationMapper);
        log.info("Orders retrieved - count: {}, total: {}", page.getNumberOfElements(), page.getTotalElements());

        return response;
    }

    @Override
    public OrderResponse updateOrder(UUID orderId, OrderUpdateRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (request.getOrderStatus() != null) {
            OrderStatus previousStatus = order.getOrderStatus();
            order.updateStatus(request.getOrderStatus());

            // Deduct stock via FIFO when order moves to CONFIRMED
            if (request.getOrderStatus() == OrderStatus.CONFIRMED && previousStatus != OrderStatus.CONFIRMED) {
                deductStockForOrder(order);
            }
        }

        // Update delivery address snapshot if provided
        if (request.getDeliveryAddress() != null) {
            OrderDeliveryAddress deliveryAddress = orderDeliveryAddressRepository.findByOrderId(orderId)
                    .orElse(new OrderDeliveryAddress());
            deliveryAddress.setOrderId(orderId);
            deliveryAddress.setVillage(request.getDeliveryAddress().getVillage());
            deliveryAddress.setCommune(request.getDeliveryAddress().getCommune());
            deliveryAddress.setDistrict(request.getDeliveryAddress().getDistrict());
            deliveryAddress.setProvince(request.getDeliveryAddress().getProvince());
            deliveryAddress.setStreetNumber(request.getDeliveryAddress().getStreetNumber());
            deliveryAddress.setHouseNumber(request.getDeliveryAddress().getHouseNumber());
            deliveryAddress.setNote(request.getDeliveryAddress().getNote());
            deliveryAddress.setLatitude(request.getDeliveryAddress().getLatitude());
            deliveryAddress.setLongitude(request.getDeliveryAddress().getLongitude());
            orderDeliveryAddressRepository.save(deliveryAddress);
        }

        if (request.getCustomerNote() != null) {
            order.setCustomerNote(request.getCustomerNote());
        }

        // Update order items if provided
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            log.info("Updating order items for order: {}", orderId);
            // Clear existing items - cascade delete will handle cleanup
            order.getItems().clear();

            // Create new items from the request
            for (com.tiffany.features.order.dto.request.OrderItemUpdateRequest itemRequest : request.getItems()) {
                OrderItem item = new OrderItem();
                item.setOrderId(orderId);
                item.setProductId(itemRequest.getProductId());
                item.setProductSizeId(itemRequest.getProductSizeId());
                item.setProductName(itemRequest.getProductName());
                item.setProductImageUrl(itemRequest.getProductImageUrl());
                item.setSizeName(itemRequest.getSizeName());

                // Set SKU and barcode: prefer product master data, fallback to request data
                Product product = productRepository.findById(itemRequest.getProductId()).orElse(null);
                item.setSku(product != null && product.getSku() != null ? product.getSku() : itemRequest.getSku());
                item.setBarcode(product != null && product.getBarcode() != null ? product.getBarcode() : itemRequest.getBarcode());

                item.setCurrentPrice(itemRequest.getCurrentPrice());
                item.setFinalPrice(itemRequest.getFinalPrice());
                item.setUnitPrice(itemRequest.getUnitPrice());
                item.setQuantity(itemRequest.getQuantity());
                item.setTotalPrice(itemRequest.getFinalPrice().multiply(new BigDecimal(itemRequest.getQuantity())));
                item.setHasPromotion(itemRequest.getHasPromotion());
                item.setPromotionType(itemRequest.getPromotionType());
                item.setPromotionValue(itemRequest.getPromotionValue());
                item.setPromotionFromDate(itemRequest.getPromotionFromDate());
                item.setPromotionToDate(itemRequest.getPromotionToDate());
                item.setOrder(order);

                order.getItems().add(item);
            }

            // Recalculate subtotal from items
            BigDecimal newSubtotal = order.getItems().stream()
                    .map(OrderItem::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            order.setSubtotal(newSubtotal);
        }

        // Pricing is updated from request fields directly
        if (request.getPricing() != null) {
            // Update discount type and reason if provided
            if (request.getPricing().getDiscountType() != null) {
                order.setDiscountType(request.getPricing().getDiscountType());
            }
            if (request.getPricing().getOrderLevelChangeReason() != null) {
                order.setOrderLevelChangeReason(request.getPricing().getOrderLevelChangeReason());
            }
        }

        // Recalculate total amount if any pricing fields are updated or items changed
        if (request.getItems() != null ||
            (request.getPricing() != null && request.getPricing().getAfter() != null &&
             (request.getPricing().getAfter().getDiscountAmount() != null ||
              request.getPricing().getAfter().getTaxAmount() != null ||
              request.getPricing().getAfter().getDeliveryFee() != null))) {
            BigDecimal subtotal = order.getSubtotal() != null ? order.getSubtotal() : BigDecimal.ZERO;
            BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal delivery = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
            BigDecimal tax = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
            order.setTotalAmount(subtotal.subtract(discount).add(delivery).add(tax));
        }

        Order updatedOrder = orderRepository.save(order);

        log.info("Order updated: {}", orderId);
        return orderMapper.toResponse(updatedOrder);
    }

    @Override
    public OrderResponse deleteOrder(UUID orderId) {
        User currentUser = securityUtils.getCurrentUser();

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

            // Set default audit trail values for cart items (no POS changes)
            orderItem.setHadChangeFromPOS(false);

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

        // Set default audit trail values for cart orders (no POS changes)
        order.setHadOrderLevelChangeFromPOS(false);
        order.setOrderLevelChangeReason("No order-level changes - regular cart order");

        BigDecimal deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal taxAmount = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
        order.setTotalAmount(subtotal.subtract(discountAmount).add(deliveryFee).add(taxAmount));
        orderRepository.save(order);
    }

    private void createPaymentRecord(Order order) {
        // Payment record creation removed - Payment entity deleted
        // Payment handling is now managed separately from orders
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

    private void createInitialOrderStatusHistory(Order order, UUID userId) {
        try {
            User user = securityUtils.getCurrentUser();
            String changedByName = user != null ? user.getFullName() : "System";

            OrderStatusHistory history = new OrderStatusHistory();
            history.setOrderId(order.getId());
            history.setOrderStatus(order.getOrderStatus());
            history.setChangedByUserId(userId);
            history.setChangedByName(changedByName);
            history.setNote("Order created from checkout");

            orderStatusHistoryRepository.save(history);
            log.info("Status history created - orderNumber: {}, status: {}", order.getOrderNumber(), order.getOrderStatus());
        } catch (Exception e) {
            log.warn("Failed to create status history: {}", e.getMessage());
        }
    }

    // Order number generation is now handled by orderNumberGenerator with per-business counters
    // Format: ORD-YYYYMMDD-XXXXX (where XXXXX can be 00001-99999, 100000 onwards)

    /**
     * Deduct stock via FIFO for each item in the order.
     * Called when order status changes to CONFIRMED.
     */
    private void deductStockForOrder(Order order) {
        // Stock deduction disabled - no-op method
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
