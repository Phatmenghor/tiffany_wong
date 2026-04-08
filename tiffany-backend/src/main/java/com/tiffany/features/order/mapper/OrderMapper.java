package com.tiffany.features.order.mapper;

import com.tiffany.features.order.dto.helper.OrderCreateHelper;
import com.tiffany.features.order.dto.helper.OrderItemCreateHelper;
import com.tiffany.features.order.dto.request.OrderCreateRequest;
import com.tiffany.features.order.dto.response.*;
import com.tiffany.features.order.models.CartItem;
import com.tiffany.features.order.models.Order;
import com.tiffany.features.order.models.OrderItem;
import com.tiffany.features.order.models.OrderStatusHistory;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.mapper.PaginationMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {OrderItemMapper.class, PaginationMapper.class, OrderStatusHistoryMapper.class})
public interface OrderMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    @Mapping(target = "createdBy", source = "createdBy")
    @Mapping(target = "updatedBy", source = "updatedBy")
    @Mapping(source = "customerName", target = "customerName")
    @Mapping(source = "customerPhone", target = "customerPhone")
    @Mapping(source = "customerEmail", target = "customerEmail")
    @Mapping(source = "orderStatus", target = "orderStatus")
    @Mapping(target = "statusHistory", expression = "java(mapStatusHistory(order))")
    OrderResponse toResponse(Order order);

    List<OrderResponse> toResponseList(List<Order> orders);

    default PaginationResponse<OrderResponse> toPaginationResponse(Page<Order> orderPage, PaginationMapper paginationMapper) {
        return paginationMapper.toPaginationResponse(orderPage, this::toResponseList);
    }

    /**
     * Create order from helper DTO - pure MapStruct mapping
     */
    Order createFromHelper(OrderCreateHelper helper);

    /**
     * Create order item from helper DTO - pure MapStruct mapping
     */
    OrderItem createOrderItemFromHelper(OrderItemCreateHelper helper);

    /**
     * Helper to build OrderCreateHelper for checkout order
     */
    default OrderCreateHelper buildOrderHelper(OrderCreateRequest request, UUID customerId, String orderNumber) {
        var builder = OrderCreateHelper.builder()
                .orderNumber(orderNumber)
                .customerId(customerId)
                .paymentMethod(request.getPayment() != null ? request.getPayment().getPaymentMethod() : null)
                .paymentStatus(request.getPayment() != null ? request.getPayment().getPaymentStatus() : null)
                .customerNote(request.getCustomerNote())
                // Initialize pricing with defaults - will be updated after items are processed
                .subtotal(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                // Initialize businessNote as empty (will be set later if provided)
                .businessNote("");

        // Delivery address will be created from addressId in service layer
        // by fetching from database - not set here

        // Set delivery option fields (no JSON serialization)
        if (request.getDeliveryOption() != null) {
            builder.deliveryOptionName(request.getDeliveryOption().getName());
            builder.deliveryOptionDescription(request.getDeliveryOption().getDescription());
            builder.deliveryOptionImageUrl(request.getDeliveryOption().getImageUrl());
            builder.deliveryOptionPrice(request.getDeliveryOption().getPrice());
            builder.deliveryFee(request.getDeliveryOption().getPrice());
        }

        return builder.build();
    }

    /**
     * Helper to build OrderItemCreateHelper from cart item
     */
    default OrderItemCreateHelper buildOrderItemHelperFromCartItem(CartItem cartItem, UUID orderId) {
        // Get promotion details from product or productSize
        String promotionType = null;
        BigDecimal promotionValue = null;
        LocalDateTime promotionFromDate = null;
        LocalDateTime promotionToDate = null;

        if (cartItem.getProduct() != null && cartItem.getProduct().getHasActivePromotion()) {
            promotionType = cartItem.getProduct().getPromotionType() != null ?
                    cartItem.getProduct().getPromotionType().toString() : null;
            promotionValue = cartItem.getProduct().getPromotionValue();
            promotionFromDate = cartItem.getProduct().getPromotionFromDate();
            promotionToDate = cartItem.getProduct().getPromotionToDate();
        }

        return OrderItemCreateHelper.builder()
                .orderId(orderId)
                .productId(cartItem.getProductId())
                .productSizeId(cartItem.getProductSizeId())
                .productName(cartItem.getProduct().getName())
                .productImageUrl(cartItem.getProduct().getMainImageUrl())
                .sizeName(cartItem.getSizeName())
                // Pricing snapshot
                .currentPrice(cartItem.getCurrentPrice())
                .finalPrice(cartItem.getFinalPrice())
                .unitPrice(cartItem.getFinalPrice())
                .hasPromotion(cartItem.hasDiscount())
                // Promotion details snapshot
                .promotionType(promotionType)
                .promotionValue(promotionValue)
                .promotionFromDate(promotionFromDate)
                .promotionToDate(promotionToDate)
                .quantity(cartItem.getQuantity())
                .build();
    }


    /**
     * Calculate total number of items in the order
     */
    default Integer calculateTotalItems(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return 0;
        }
        return order.getItems().stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();
    }

    /**
     * Map order status history to response DTOs
     * Returns empty list if no history exists (order just created)
     */
    default List<OrderStatusHistoryResponse> mapStatusHistory(Order order) {
        if (order.getStatusHistory() == null || order.getStatusHistory().isEmpty()) {
            // Return empty list instead of null for consistency with client expectations
            return List.of();
        }

        return order.getStatusHistory().stream()
                .map(history -> {
                    String changedByUserName = null;
                    UUID changedByUserId = null;
                    if (history.getChangedByUser() != null) {
                        changedByUserId = history.getChangedByUserId();
                        changedByUserName = history.getChangedByUser().getUserIdentifier();
                    }
                    return OrderStatusHistoryResponse.builder()
                            .id(history.getId())
                            .statusName(history.getOrderStatus() != null ?
                                    history.getOrderStatus().getDisplayName() : null)
                            .statusDescription(history.getOrderStatus() != null ?
                                    history.getOrderStatus().getDescription() : null)
                            .note(history.getNote())
                            .changedByUserId(changedByUserId)
                            .changedByUserName(changedByUserName)
                            .changedAt(history.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
