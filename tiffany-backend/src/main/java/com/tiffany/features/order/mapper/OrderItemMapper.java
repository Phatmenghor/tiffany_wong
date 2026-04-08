package com.tiffany.features.order.mapper;

import com.tiffany.features.order.dto.response.OrderItemResponse;
import com.tiffany.features.order.models.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderItemMapper {

    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "product", expression = "java(mapProductInfo(orderItem))")
    OrderItemResponse toResponse(OrderItem orderItem);

    List<OrderItemResponse> toResponseList(List<OrderItem> orderItems);

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

        info.setCurrentPriceBeforeDiscount(orderItem.getCurrentPrice());
        info.setCurrentPriceAfterDiscount(orderItem.getFinalPrice());
        info.setHasDiscount(orderItem.getHasPromotion());

        if (orderItem.getHasPromotion() != null && orderItem.getHasPromotion()) {
            BigDecimal priceBeforeDiscount = orderItem.getCurrentPrice() != null ? orderItem.getCurrentPrice() : BigDecimal.ZERO;
            BigDecimal priceAfterDiscount = orderItem.getFinalPrice() != null ? orderItem.getFinalPrice() : BigDecimal.ZERO;

            BigDecimal discountAmount = priceBeforeDiscount.subtract(priceAfterDiscount);
            info.setDiscountAmountPerItem(discountAmount);
            info.setDiscountType(orderItem.getPromotionType());
            info.setPromotionName(orderItem.getPromotionType() + " - " + orderItem.getPromotionValue());

            if (priceBeforeDiscount.compareTo(BigDecimal.ZERO) > 0 && "PERCENTAGE".equals(orderItem.getPromotionType())) {
                BigDecimal discountPercent = discountAmount.divide(priceBeforeDiscount, 2, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal(100));
                info.setDiscountPercentage(discountPercent);
            }
        }

        return info;
    }
}