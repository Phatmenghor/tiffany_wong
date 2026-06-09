package com.tiffany.features.order.mapper;

import com.tiffany.features.order.dto.response.OrderItemResponse;
import com.tiffany.features.order.models.OrderItem;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderItemMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "productId", source = "productId")
    @Mapping(target = "productName", source = "productName")
    @Mapping(target = "productImageUrl", source = "productImageUrl")
    @Mapping(target = "productSizeId", source = "productSizeId")
    @Mapping(target = "sizeName", source = "sizeName")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "displayPrice", source = "finalPrice")
    @Mapping(target = "displayOriginPrice", source = "currentPrice")
    @Mapping(target = "displayPromotionType", source = "promotionType")
    @Mapping(target = "displayPromotionValue", source = "promotionValue")
    @Mapping(target = "displayPromotionFromDate", source = "promotionFromDate")
    @Mapping(target = "displayPromotionToDate", source = "promotionToDate")
    @Mapping(target = "hasActivePromotion", source = "hasPromotion")
    OrderItemResponse toResponse(OrderItem orderItem);

    @AfterMapping
    default void calculateSubtotals(OrderItem orderItem, @MappingTarget OrderItemResponse response) {
        if (orderItem.getCurrentPrice() != null && orderItem.getFinalPrice() != null && orderItem.getQuantity() != null) {
            BigDecimal quantity = BigDecimal.valueOf(orderItem.getQuantity());
            response.setSubtotalBeforeDiscount(orderItem.getCurrentPrice().multiply(quantity));
            response.setSubtotalDiscountAmount(orderItem.getCurrentPrice().subtract(orderItem.getFinalPrice()).multiply(quantity));
            response.setSubtotalAfterDiscount(orderItem.getFinalPrice().multiply(quantity));
        }
    }

    List<OrderItemResponse> toResponseList(List<OrderItem> orderItems);
}