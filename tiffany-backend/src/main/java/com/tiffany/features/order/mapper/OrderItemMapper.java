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
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "currentPriceBeforeDiscount", source = "currentPrice")
    @Mapping(target = "currentPriceAfterDiscount", source = "finalPrice")
    @Mapping(target = "hasDiscount", source = "hasPromotion")
    @Mapping(target = "discountType", source = "promotionType")
    @Mapping(target = "product", expression = "java(mapProductInfo(orderItem))")
    OrderItemResponse toResponse(OrderItem orderItem);

    List<OrderItemResponse> toResponseList(List<OrderItem> orderItems);

    @AfterMapping
    default void calculatePricing(@MappingTarget OrderItemResponse response, OrderItem orderItem) {
        if (response.getCurrentPriceBeforeDiscount() != null && response.getQuantity() != null) {
            BigDecimal subtotalBeforeDiscount = response.getCurrentPriceBeforeDiscount()
                    .multiply(new BigDecimal(response.getQuantity()));
            response.setSubtotalBeforeDiscount(subtotalBeforeDiscount);

            if (response.getCurrentPriceAfterDiscount() != null) {
                BigDecimal subtotalAfterDiscount = response.getCurrentPriceAfterDiscount()
                        .multiply(new BigDecimal(response.getQuantity()));
                response.setSubtotalAfterDiscount(subtotalAfterDiscount);

                BigDecimal subtotalDiscountAmount = subtotalBeforeDiscount.subtract(subtotalAfterDiscount);
                response.setSubtotalDiscountAmount(subtotalDiscountAmount);

                if (response.getHasDiscount() != null && response.getHasDiscount()) {
                    BigDecimal discountAmountPerItem = response.getCurrentPriceBeforeDiscount()
                            .subtract(response.getCurrentPriceAfterDiscount());
                    response.setDiscountAmountPerItem(discountAmountPerItem);

                    if ("PERCENTAGE".equals(response.getDiscountType()) && response.getCurrentPriceBeforeDiscount().compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal discountPercent = discountAmountPerItem
                                .divide(response.getCurrentPriceBeforeDiscount(), 2, java.math.RoundingMode.HALF_UP)
                                .multiply(new BigDecimal(100));
                        response.setDiscountPercentage(discountPercent);
                    }
                }
            }
        }
    }

    default OrderItemResponse.OrderItemProductInfo mapProductInfo(OrderItem orderItem) {
        if (orderItem.getProduct() == null) {
            return null;
        }

        OrderItemResponse.OrderItemProductInfo info = new OrderItemResponse.OrderItemProductInfo();

        info.setId(orderItem.getProduct().getId());
        info.setName(orderItem.getProductName());
        info.setImageUrl(orderItem.getProductImageUrl());
        info.setSku(orderItem.getSku());
        info.setBarcode(orderItem.getBarcode());
        info.setSizeId(orderItem.getProductSizeId());
        info.setSizeName(orderItem.getSizeName());

        if (orderItem.getProduct().getStatus() != null) {
            info.setStatus(orderItem.getProduct().getStatus().toString());
        }

        if (orderItem.getHasPromotion() != null && orderItem.getHasPromotion()) {
            info.setPromotionName(orderItem.getPromotionType() + " - " + orderItem.getPromotionValue());
        }

        return info;
    }
}