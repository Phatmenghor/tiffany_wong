package com.tiffany.features.order.service.impl;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.enums.payment.PaymentStatus;
import com.tiffany.exception.custom.NotFoundException;
import com.tiffany.exception.custom.ValidationException;
import com.tiffany.features.auth.models.User;
import com.tiffany.features.order.dto.filter.OrderFilterRequest;
import com.tiffany.features.order.dto.helper.OrderPaymentCreateHelper;
import com.tiffany.features.order.dto.helper.OrderCreateHelper;
import com.tiffany.features.order.dto.helper.OrderItemCreateHelper;
import com.tiffany.features.order.dto.request.OrderCreateRequest;
import com.tiffany.features.order.dto.response.OrderResponse;
import com.tiffany.features.order.dto.update.OrderUpdateRequest;
import com.tiffany.enums.payment.PaymentMethod;
import com.tiffany.features.main.models.Product;
import com.tiffany.features.main.repository.ProductRepository;
import com.tiffany.features.order.mapper.OrderPaymentMapper;
import com.tiffany.features.order.mapper.OrderMapper;
import com.tiffany.features.order.models.OrderPayment;
import com.tiffany.features.order.models.Cart;
import com.tiffany.features.order.models.Order;
import com.tiffany.features.order.models.OrderItem;
import com.tiffany.features.order.models.OrderDeliveryAddress;
import com.tiffany.features.order.repository.OrderPaymentRepository;
import com.tiffany.features.order.repository.CartRepository;
import com.tiffany.features.order.repository.OrderRepository;
import com.tiffany.features.order.repository.OrderStatusHistoryRepository;
import com.tiffany.features.order.repository.OrderDeliveryAddressRepository;
import com.tiffany.features.order.models.OrderStatusHistory;
import com.tiffany.features.order.models.OrderDeliveryOption;
import com.tiffany.features.order.repository.OrderDeliveryOptionRepository;
import com.tiffany.features.order.service.OrderService;
import com.tiffany.security.SecurityUtils;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.generate.ReferenceNumberGenerator;
import com.tiffany.shared.generate.OrderNumberGenerator;
import com.tiffany.shared.generate.PaymentReferenceGenerator;
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
    private final OrderPaymentRepository paymentRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final ProductRepository productRepository;
    private final OrderDeliveryAddressRepository orderDeliveryAddressRepository;
    private final OrderDeliveryOptionRepository orderDeliveryOptionRepository;
    private final OrderMapper orderMapper;
    private final OrderPaymentMapper paymentMapper;
    private final SecurityUtils securityUtils;
    private final ReferenceNumberGenerator referenceNumberGenerator;
    private final OrderNumberGenerator orderNumberGenerator;
    private final PaymentReferenceGenerator paymentReferenceGenerator;
    private final PaginationMapper paginationMapper;

    @Override
    public OrderResponse createOrderFromCart(OrderCreateRequest request) {
        log.info("🛍️  [CHECKOUT START] Creating order from cart - Customer: {}",
            securityUtils.getCurrentUser().getId());

        User currentUser = securityUtils.getCurrentUser();

        try {
            log.debug("📋 [STEP 1/6] Creating base order...");
            Order order = createBaseOrder(request, currentUser.getId());

            // Set order status - default to PENDING if not specified
            OrderStatus status = request.getOrderStatus() != null ? request.getOrderStatus() : OrderStatus.PENDING;
            log.debug("📋 [STEP 2/6] Setting order status: {}", status);
            order.setOrderStatus(status);

            log.debug("📋 [STEP 3/6] Saving base order...");
            Order savedOrder = orderRepository.save(order);
            log.info("✅ [ORDER CREATED] Order #{} saved with ID: {}", savedOrder.getOrderNumber(), savedOrder.getId());

            // Create delivery snapshots from request - fetch address by ID
            if (request.getAddressId() != null) {
                OrderDeliveryAddress deliveryAddress = createDeliveryAddressSnapshot(savedOrder.getId(), request.getAddressId());
                if (deliveryAddress != null) {
                    orderDeliveryAddressRepository.save(deliveryAddress);
                    log.debug("✅ [DELIVERY ADDRESS SNAPSHOT] Created for order: {}", savedOrder.getId());
                }
            }

            // Set customer details
            if (request.getCustomerName() != null) {
                savedOrder.setCustomerName(request.getCustomerName());
            }
            if (request.getCustomerPhone() != null) {
                savedOrder.setCustomerPhone(request.getCustomerPhone());
            }
            if (request.getCustomerEmail() != null) {
                savedOrder.setCustomerEmail(request.getCustomerEmail());
            }
            // Save customer details
            orderRepository.save(savedOrder);

            if (request.getDeliveryOption() != null) {
                OrderDeliveryOption deliveryOption = new OrderDeliveryOption();
                deliveryOption.setOrderId(savedOrder.getId());
                deliveryOption.setName(request.getDeliveryOption().getName());
                deliveryOption.setDescription(request.getDeliveryOption().getDescription());
                deliveryOption.setImageUrl(request.getDeliveryOption().getImageUrl());
                deliveryOption.setPrice(request.getDeliveryOption().getPrice());
                orderDeliveryOptionRepository.save(deliveryOption);
                log.debug("✅ [DELIVERY OPTION SNAPSHOT] Created for order: {}", savedOrder.getId());

                // Update delivery fee in order
                savedOrder.setDeliveryFee(request.getDeliveryOption().getPrice());
            }

            // Create initial order status history to track when order was created
            log.debug("📋 [STEP 3.5/6] Creating initial status history...");
            createInitialOrderStatusHistory(savedOrder, currentUser.getId());

            // Create order items from cart summary (frontend) or database cart
            if (request.getCart() != null && request.getCart().getItems() != null && !request.getCart().getItems().isEmpty()) {
                log.info("📋 [STEP 4/7] Processing {} items from frontend cart summary", request.getCart().getItems().size());
                createOrderItemsFromCartSummary(savedOrder.getId(), request.getCart(), null);
            } else {
                log.info("📋 [STEP 4/7] Processing items from database cart");
                Cart cart = cartRepository.findByUserIdWithItems(currentUser.getId())
                        .orElseThrow(() -> new ValidationException("Cart is empty or not found"));

                if (cart.getItems() == null || cart.getItems().isEmpty()) {
                    throw new ValidationException("Cannot create order from empty cart");
                }

                createOrderItemsFromCart(savedOrder.getId(), cart);
            }

            log.debug("📋 [STEP 5/7] Creating payment record...");
            createPaymentRecord(savedOrder);

            log.debug("📋 [STEP 6/7] Clearing cart...");
            clearCartAfterOrder(currentUser.getId());

            log.info("✅ [CHECKOUT SUCCESS] Order created successfully: {} - Fetching full response...", savedOrder.getOrderNumber());
            OrderResponse response = getOrderById(savedOrder.getId());
            log.info("🎉 [CHECKOUT COMPLETE] Order #{} - Total: {}, Items: {}",
                response.getOrderNumber(),
                response.getPricing() != null && response.getPricing().getAfter() != null ?
                    response.getPricing().getAfter().getFinalTotal() : "N/A",
                response.getItems().size());
            return response;
        } catch (Exception e) {
            log.error("❌ [CHECKOUT ERROR] Failed to create order: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<OrderResponse> getCustomerOrderHistory(OrderFilterRequest filter) {
        long startTime = System.currentTimeMillis();
        User currentUser = securityUtils.getCurrentUser();

        log.info("📋 [CUSTOMER ORDER HISTORY] Fetching orders for customer: {} | Page: {}, Size: {}",
                currentUser.getId(), filter.getPageNo(), filter.getPageSize());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        log.debug("🔍 [DB QUERY] Executing paginated query with eager loading of business and customer...");
        Page<Order> page = orderRepository.findByCustomerIdAndIsDeletedFalseOrderByCreatedAtDesc(currentUser.getId(), pageable);
        log.debug("✅ [DB QUERY COMPLETE] Retrieved {} orders from database", page.getNumberOfElements());

        // Eagerly load statusHistory for all orders to prevent lazy loading during mapping
        log.debug("📌 [LOADING STATUS HISTORY] Loading status history for {} orders...", page.getNumberOfElements());
        page.getContent().forEach(order -> {
            List<OrderStatusHistory> statusHistory = orderRepository.findStatusHistoryByOrderId(order.getId());
            order.setStatusHistory(statusHistory);
            log.debug("   - Order {}: {} status history records", order.getOrderNumber(), statusHistory.size());
        });

        log.debug("🔄 [MAPPING] Converting {} orders to response DTOs...", page.getNumberOfElements());
        PaginationResponse<OrderResponse> response = orderMapper.toPaginationResponse(page, paginationMapper);

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ [CUSTOMER ORDER HISTORY COMPLETE] Retrieved {} orders in {} ms | Total: {} | Page: {}/{}",
                page.getNumberOfElements(), duration, page.getTotalElements(),
                page.getNumber() + 1, page.getTotalPages());

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
        long startTime = System.currentTimeMillis();
        User currentUser = securityUtils.getCurrentUser();

        log.info("📊 [GET ALL ORDERS] Starting retrieval | User: {}",
                currentUser.getId());

        log.debug("🔍 [FILTER PARAMETERS] OrderStatus: {}, PaymentMethod: {}, PaymentStatus: {}",
                filter.getOrderStatus(), filter.getPaymentMethod(), filter.getPaymentStatus());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );
        log.debug("📑 [PAGINATION] PageNo: {}, PageSize: {}, SortBy: {}, Direction: {}",
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection());

        // Apply filters: orderStatus, paymentMethod, paymentStatus
        log.debug("🗄️  [DB QUERY START] Executing filtered query with eager loading...");
        long queryStartTime = System.currentTimeMillis();
        Page<Order> page = orderRepository.findAllWithFilters(
                filter.getOrderStatus(),
                filter.getPaymentMethod(),
                filter.getPaymentStatus(),
                pageable
        );
        long queryDuration = System.currentTimeMillis() - queryStartTime;
        log.info("✅ [DB QUERY COMPLETE] Retrieved {} orders (query took {} ms) | Total: {} | Pages: {}",
                page.getNumberOfElements(), queryDuration, page.getTotalElements(), page.getTotalPages());

        // Eagerly load statusHistory for all orders to prevent lazy loading during mapping
        log.debug("📌 [LOADING STATUS HISTORY] Loading status history for {} orders...", page.getNumberOfElements());
        int historyCount = 0;
        for (Order order : page.getContent()) {
            List<OrderStatusHistory> statusHistory = orderRepository.findStatusHistoryByOrderId(order.getId());
            order.setStatusHistory(statusHistory);
            historyCount += statusHistory.size();
            log.debug("   - Order {}: {} status history records", order.getOrderNumber(), statusHistory.size());
        }
        log.debug("✅ [STATUS HISTORY LOADED] Total history records: {}", historyCount);

        log.debug("🔄 [MAPPING] Converting {} orders to response DTOs...", page.getNumberOfElements());
        long mappingStartTime = System.currentTimeMillis();
        PaginationResponse<OrderResponse> response = orderMapper.toPaginationResponse(page, paginationMapper);
        long mappingDuration = System.currentTimeMillis() - mappingStartTime;
        log.debug("✅ [MAPPING COMPLETE] Conversion took {} ms", mappingDuration);

        long totalDuration = System.currentTimeMillis() - startTime;
        log.info("✅ [GET ALL ORDERS COMPLETE] Total time: {} ms | Orders: {} | Total records: {} | Pages: {}/{}",
                totalDuration, page.getNumberOfElements(), page.getTotalElements(),
                page.getNumber() + 1, page.getTotalPages());

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

        // Update delivery option snapshot if provided
        if (request.getDeliveryOption() != null) {
            OrderDeliveryOption deliveryOption = orderDeliveryOptionRepository.findByOrderId(orderId)
                    .orElse(new OrderDeliveryOption());
            deliveryOption.setOrderId(orderId);
            deliveryOption.setName(request.getDeliveryOption().getName());
            deliveryOption.setDescription(request.getDeliveryOption().getDescription());
            deliveryOption.setImageUrl(request.getDeliveryOption().getImageUrl());
            deliveryOption.setPrice(request.getDeliveryOption().getPrice());
            orderDeliveryOptionRepository.save(deliveryOption);

            order.setDeliveryFee(request.getDeliveryOption().getPrice());

            // Recalculate total with new delivery fee
            order.setTotalAmount(order.getSubtotal().add(request.getDeliveryOption().getPrice()));
        }

        if (request.getPayment() != null) {
            if (request.getPayment().getPaymentMethod() != null) {
                try {
                    order.setPaymentMethod(PaymentMethod.valueOf(request.getPayment().getPaymentMethod()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid payment method: {}", request.getPayment().getPaymentMethod());
                }
            }
            if (request.getPayment().getPaymentStatus() != null) {
                try {
                    order.setPaymentStatus(PaymentStatus.valueOf(request.getPayment().getPaymentStatus()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid payment status: {}", request.getPayment().getPaymentStatus());
                }
            }
        }
        if (request.getCustomerNote() != null) {
            order.setCustomerNote(request.getCustomerNote());
        }
        if (request.getBusinessNote() != null) {
            order.setBusinessNote(request.getBusinessNote());
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
              (request.getPricing().getAfter().getDeliveryFee() != null && request.getDeliveryOption() == null)))) {
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
        // Generate order number (ORD-YYYYMMDD-XXXXX)
        String orderNumber = orderNumberGenerator.generateOrderNumber();
        OrderCreateHelper helper = orderMapper.buildOrderHelper(request, customerId, orderNumber);
        Order order = orderMapper.createFromHelper(helper);
        if (request.getOrderFrom() != null) {
            order.setOrderFrom(request.getOrderFrom());
        }
        return order;
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

    private void createOrderItemsFromCartSummary(UUID orderId, Object cartSummary,
                                                  PricingInfo pricingInfo) {
        // Handle both CartSummaryResponse and CartSummary
        if (!(cartSummary instanceof com.tiffany.features.order.dto.response.CartSummaryResponse)) {
            log.warn("Invalid cart summary type: {}", cartSummary.getClass().getName());
            return;
        }

        com.tiffany.features.order.dto.response.CartSummaryResponse cartResponse =
                (com.tiffany.features.order.dto.response.CartSummaryResponse) cartSummary;

        log.debug("🛒 [CART SUMMARY] Processing {} items for order: {}", cartResponse.getItems().size(), orderId);

        BigDecimal subtotal = cartResponse.getSubtotal() != null ? cartResponse.getSubtotal() : BigDecimal.ZERO;
        BigDecimal discountAmount = cartResponse.getTotalDiscount() != null ? cartResponse.getTotalDiscount() : BigDecimal.ZERO;

        log.debug("💰 [PRICING] Subtotal: {}, Discount: {}", subtotal, discountAmount);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    log.error("❌ [ERROR] Order not found: {}", orderId);
                    return new NotFoundException("Order not found: " + orderId);
                });

        log.debug("✅ [ORDER LOADED] Order ID: {}, Items List: {}", orderId, order.getItems() != null ? "initialized" : "null");

        int itemCount = 0;
        for (var item : cartResponse.getItems()) {
            itemCount++;

            // Get product for SKU/barcode
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product not found: " + item.getProductId()));

            // Use after snapshot for final pricing if available (new audit trail structure)
            BigDecimal finalPrice = item.getAfter() != null ? item.getAfter().getFinalPrice() : item.getFinalPrice();

            log.debug("📦 [ITEM {}] Product: {} (ID: {}), Qty: {}, Price: {}, HasChangeFromPOS: {}",
                itemCount, item.getProductName(), item.getProductId(), item.getQuantity(), finalPrice, item.getHadChangeFromPOS());

            OrderItemCreateHelper helper = OrderItemCreateHelper.builder()
                    .orderId(orderId)
                    .productId(item.getProductId())
                    .productSizeId(item.getProductSizeId())
                    .productName(item.getProductName())
                    .productImageUrl(item.getProductImageUrl())
                    .sizeName(item.getSizeName())
                    // Use before snapshot for current price if available
                    .currentPrice(item.getBefore() != null ? item.getBefore().getCurrentPrice() : item.getCurrentPrice())
                    .finalPrice(finalPrice)
                    .unitPrice(finalPrice)
                    .hasPromotion(item.getAfter() != null ? item.getAfter().getHasActivePromotion() : item.getHasActivePromotion())
                    .promotionType(item.getAfter() != null && item.getAfter().getPromotionType() != null ?
                            item.getAfter().getPromotionType() : item.getPromotionType())
                    .promotionValue(item.getAfter() != null ? item.getAfter().getPromotionValue() : item.getPromotionValue())
                    .quantity(item.getQuantity())
                    // Set SKU and barcode from product master data (primary source)
                    .sku(product.getSku())
                    .barcode(product.getBarcode())
                    .build();

            OrderItem orderItem = orderMapper.createOrderItemFromHelper(helper);
            orderItem.setTotalPrice(item.getTotalPrice() != null ? item.getTotalPrice() :
                    finalPrice.multiply(new BigDecimal(item.getQuantity())));

            // Store audit trail - always set hadChangeFromPOS (true/false, never null)
            orderItem.setHadChangeFromPOS(item.getHadChangeFromPOS() != null && item.getHadChangeFromPOS());

            orderItem.setOrder(order);
            order.getItems().add(orderItem);

            // Save the order item
            orderRepository.save(order);

            log.debug("✅ [ITEM ADDED] Item {} added to order, total items now: {}", itemCount, order.getItems().size());
        }

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);

        BigDecimal deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal taxAmount = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(deliveryFee).add(taxAmount);
        order.setTotalAmount(totalAmount);

        // Store order-level pricing audit trail if provided
        if (pricingInfo != null) {
            // Always set hadOrderLevelChangeFromPOS (true/false, never null)
            order.setHadOrderLevelChangeFromPOS(pricingInfo.getHadOrderLevelChangeFromPOS() != null && pricingInfo.getHadOrderLevelChangeFromPOS());

            // Store the discount type (PERCENTAGE or FIXED_AMOUNT)
            if (pricingInfo.getDiscountType() != null && !pricingInfo.getDiscountType().isEmpty()) {
                order.setDiscountType(pricingInfo.getDiscountType());
            }

            // Store the reason for order-level changes
            if (pricingInfo.getOrderLevelChangeReason() != null && !pricingInfo.getOrderLevelChangeReason().isEmpty()) {
                order.setOrderLevelChangeReason(pricingInfo.getOrderLevelChangeReason());
            } else if (!order.getHadOrderLevelChangeFromPOS()) {
                // Set default reason if no change occurred
                order.setOrderLevelChangeReason("No order-level changes from POS");
            }
            // Note: Pricing snapshots are reconstructed from order fields (subtotal, discount, delivery, tax, total) when needed
        }

        log.info("💾 [SAVING ORDER] Order ID: {}, Items: {}, Total: {} (Subtotal: {}, Discount: {}, Delivery: {}, Tax: {})",
            orderId, order.getItems().size(), totalAmount, subtotal, discountAmount, deliveryFee, taxAmount);

        orderRepository.save(order);
        log.info("✅ [ORDER ITEMS SAVED] Successfully saved {} items for order: {}", order.getItems().size(), orderId);
    }

    private void createPaymentRecord(Order order) {
        BigDecimal subtotal = order.getSubtotal() != null ? order.getSubtotal() : BigDecimal.ZERO;
        BigDecimal discountAmount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal taxAmount = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;

        OrderPaymentCreateHelper helper = OrderPaymentCreateHelper.builder()
                .orderId(order.getId())
                .referenceNumber(paymentReferenceGenerator.generateUniqueReference())
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .deliveryFee(deliveryFee)
                .taxAmount(taxAmount)
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .customerPaymentMethod(null)
                .build();
        OrderPayment payment = paymentMapper.createFromHelper(helper);
        paymentRepository.save(payment);
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
            // Create initial status history entry to track order creation
            User user = securityUtils.getCurrentUser();
            String changedByName = user != null ? user.getFullName() : "System";

            OrderStatusHistory history = new OrderStatusHistory();
            history.setOrderId(order.getId());
            history.setOrderStatus(order.getOrderStatus());
            history.setChangedByUserId(userId);
            history.setChangedByName(changedByName);  // Snapshot of user's name at time of change
            history.setNote("Order created from checkout");

            orderStatusHistoryRepository.save(history);
            log.debug("✅ [STATUS HISTORY] Created initial status history for order: {} with status: {} by user: {}",
                order.getOrderNumber(), order.getOrderStatus(), changedByName);
        } catch (Exception e) {
            log.warn("⚠️  [STATUS HISTORY] Failed to create initial status history: {}", e.getMessage());
            // Don't throw exception - order creation should not fail if history creation fails
        }
    }

    // Order number generation is now handled by orderNumberGenerator with per-business counters
    // Format: ORD-YYYYMMDD-XXXXX (where XXXXX can be 00001-99999, 100000 onwards)

    @Override

    /**
     * Deduct stock via FIFO for each item in the order.
     * Called when order status changes to CONFIRMED.
     */
    private void deductStockForOrder(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) return;

        for (OrderItem item : order.getItems()) {
            try {
                    item.getProductId(),
                    item.getProductSizeId(),
                    item.getQuantity(),
                    order.getId(),
                    "Order confirmed: " + order.getOrderNumber()
                );
            } catch (Exception e) {
                log.warn("Failed to deduct stock for product {} in order {}: {}",
                    item.getProductId(), order.getOrderNumber(), e.getMessage());
            }
        }

        log.info("Stock deducted via FIFO for confirmed order: {}", order.getOrderNumber());
    }

    /**
     * Create delivery address snapshot by storing reference to location
     * Address details can be updated later through OrderUpdateRequest
     */
    private OrderDeliveryAddress createDeliveryAddressSnapshot(UUID orderId, UUID addressId) {
        try {
            // Create snapshot with reference to location
            OrderDeliveryAddress deliveryAddress = new OrderDeliveryAddress();
            deliveryAddress.setOrderId(orderId);
            deliveryAddress.setLocationId(addressId);

            log.debug("✅ [DELIVERY ADDRESS SNAPSHOT] Created with location reference for order: {}", orderId);
            return deliveryAddress;
        } catch (Exception e) {
            log.error("❌ [ADDRESS ERROR] Error creating delivery address snapshot: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create delivery address snapshot", e);
        }
    }
}
