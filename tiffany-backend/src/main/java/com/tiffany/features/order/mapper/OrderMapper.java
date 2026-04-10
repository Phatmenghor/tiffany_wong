package com.tiffany.features.order.mapper;

import com.tiffany.features.main.models.Product;
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
import java.time.temporal.ChronoUnit;
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
    @Mapping(source = "customerId", target = "customerId", numberFormat = "")
    @Mapping(source = "customerName", target = "customerName")
    @Mapping(source = "orderStatus", target = "orderStatus")
    @Mapping(source = "paymentMethod", target = "paymentMethod")
    @Mapping(source = "paymentStatus", target = "paymentStatus")
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
        return OrderCreateHelper.builder()
                .orderNumber(orderNumber)
                .customerId(customerId)
                .customerNote(request.getCustomerNote())
                .orderStatus(request.getOrderStatus())
                .paymentMethod(request.getPaymentBy())
                .subtotal(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .build();
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

        if (cartItem.getProduct() != null && isPromotionActive(cartItem.getProduct())) {
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
     * Check if promotion is active for a product
     */
    default boolean isPromotionActive(Product product) {
        if (product.getPromotionValue() == null || product.getPromotionType() == null) {
            return false;
        }

        LocalDateTime today = LocalDateTime.now().truncatedTo(ChronoUnit.DAYS);

        if (product.getPromotionFromDate() != null && today.isBefore(product.getPromotionFromDate().truncatedTo(ChronoUnit.DAYS))) {
            return false;
        }

        if (product.getPromotionToDate() != null && today.isAfter(product.getPromotionToDate().truncatedTo(ChronoUnit.DAYS))) {
            return false;
        }

        return true;
    }
}
