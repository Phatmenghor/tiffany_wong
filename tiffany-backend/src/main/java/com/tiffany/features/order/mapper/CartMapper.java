package com.tiffany.features.order.mapper;

import com.tiffany.features.order.dto.helper.CartCreateHelper;
import com.tiffany.features.order.dto.response.CartItemResponse;
import com.tiffany.features.order.dto.response.CartSummaryResponse;
import com.tiffany.features.order.models.Cart;
import com.tiffany.features.order.models.CartItem;
import org.mapstruct.*;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CartMapper {

    @Mapping(target = "productId", source = "productId")
    @Mapping(target = "productSizeId", source = "productSizeId")
    @Mapping(target = "sizeName", source = "sizeName")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "subtotalAfterDiscount", expression = "java(cartItem.getTotalPrice())")
    CartItemResponse toItemResponse(CartItem cartItem);

    @AfterMapping
    default void setProductInfo(@MappingTarget CartItemResponse response, CartItem cartItem) {
        response.setProductId(cartItem.getProductId());
        response.setProductSizeId(cartItem.getProductSizeId());
        response.setSizeName(cartItem.getSizeName());
        if (cartItem.getProduct() != null) {
            response.setProductName(cartItem.getProduct().getName());
            response.setProductImageUrl(cartItem.getProduct().getMainImageUrl());
            response.setSku(cartItem.getProduct().getSku());
        }
    }

    @AfterMapping
    default void setDiscountDetails(@MappingTarget CartItemResponse response, CartItem cartItem) {
        // Set display prices from cart item
        response.setDisplayPrice(cartItem.getFinalPrice());
        response.setDisplayOriginPrice(cartItem.getCurrentPrice());

        // Check for promotions on product size first, then product
        if (cartItem.getProductSize() != null && cartItem.getProductSize().isPromotionActive()) {
            response.setDisplayPromotionType(cartItem.getProductSize().getPromotionType() != null ?
                    cartItem.getProductSize().getPromotionType().toString() : null);
            response.setDisplayPromotionFromDate(cartItem.getProductSize().getPromotionFromDate());
            response.setDisplayPromotionToDate(cartItem.getProductSize().getPromotionToDate());
            response.setHasActivePromotion(true);
            // Calculate actual discount value (per item)
            calculateDisplayPromotionValue(response);
        } else if (cartItem.getProduct() != null && cartItem.getProduct().isPromotionActive()) {
            response.setDisplayPromotionType(cartItem.getProduct().getPromotionType() != null ?
                    cartItem.getProduct().getPromotionType().toString() : null);
            response.setDisplayPromotionFromDate(cartItem.getProduct().getPromotionFromDate());
            response.setDisplayPromotionToDate(cartItem.getProduct().getPromotionToDate());
            response.setHasActivePromotion(true);
            // Calculate actual discount value (per item)
            calculateDisplayPromotionValue(response);
        } else {
            response.setHasActivePromotion(false);
        }
    }

    private void calculateDisplayPromotionValue(CartItemResponse response) {
        if (response.getDisplayOriginPrice() != null && response.getDisplayPrice() != null) {
            BigDecimal discountPerItem = response.getDisplayOriginPrice().subtract(response.getDisplayPrice());

            if (discountPerItem.compareTo(BigDecimal.ZERO) > 0) {
                // If PERCENTAGE type, calculate the percentage discount
                if ("PERCENTAGE".equals(response.getDisplayPromotionType()) &&
                    response.getDisplayOriginPrice().compareTo(BigDecimal.ZERO) > 0) {
                    // Calculate percentage: (discount / origin) × 100, rounded to 2 decimals
                    BigDecimal percentage = discountPerItem
                            .multiply(new BigDecimal(100))
                            .divide(response.getDisplayOriginPrice(), 2, java.math.RoundingMode.HALF_UP);
                    response.setDisplayPromotionValue(percentage);
                } else {
                    // For FIXED_AMOUNT, use the discount amount directly
                    response.setDisplayPromotionValue(discountPerItem.setScale(2, java.math.RoundingMode.HALF_UP));
                }
            }
        }
    }

    @AfterMapping
    default void calculatePricingBreakdown(@MappingTarget CartItemResponse response, CartItem cartItem) {
        if (response.getDisplayOriginPrice() != null && response.getQuantity() != null) {
            // Calculate subtotal before discount
            BigDecimal subtotalBeforeDiscount = response.getDisplayOriginPrice()
                    .multiply(new BigDecimal(response.getQuantity()));
            response.setSubtotalBeforeDiscount(subtotalBeforeDiscount);

            // Calculate subtotal discount amount
            if (response.getSubtotalAfterDiscount() != null) {
                BigDecimal subtotalDiscountAmount = subtotalBeforeDiscount.subtract(response.getSubtotalAfterDiscount());
                response.setSubtotalDiscountAmount(subtotalDiscountAmount);
            }
        }
    }

    List<CartItemResponse> toItemResponseList(List<CartItem> cartItems);

    @Mapping(target = "totalItems", expression = "java(cart.getTotalItems())")
    @Mapping(target = "subtotal", ignore = true)
    @Mapping(target = "totalDiscount", ignore = true)
    @Mapping(target = "finalTotal", ignore = true)
    CartSummaryResponse toSummaryResponse(Cart cart);

    @AfterMapping
    default void setSummaryCartItems(@MappingTarget CartSummaryResponse response, Cart cart) {
        if (cart.getItems() != null) {
            response.setItems(toItemResponseList(cart.getItems()));

            // Calculate total quantity
            int totalQuantity = cart.getItems().stream()
                    .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                    .sum();
            response.setTotalQuantity(totalQuantity);

            // Calculate subtotal before discount
            BigDecimal subtotalBeforeDiscount = cart.getItems().stream()
                    .map(item -> {
                        BigDecimal price = item.getCurrentPrice() != null ? item.getCurrentPrice() : BigDecimal.ZERO;
                        int qty = item.getQuantity() != null ? item.getQuantity() : 0;
                        return price.multiply(new BigDecimal(qty));
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            response.setSubtotalBeforeDiscount(subtotalBeforeDiscount);

            // Calculate subtotal (after discount)
            BigDecimal subtotal = cart.getItems().stream()
                    .map(CartItem::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            response.setSubtotal(subtotal);

            // Calculate total discount
            BigDecimal totalDiscount = subtotalBeforeDiscount.subtract(subtotal);
            response.setTotalDiscount(totalDiscount);

            // Calculate final total (same as subtotal after discount)
            response.setFinalTotal(subtotal);
        }
    }

    default BigDecimal calculateFinalTotal(Cart cart) {
        BigDecimal subtotal = cart.getSubtotal() != null ? cart.getSubtotal() : BigDecimal.ZERO;
        BigDecimal totalDiscount = cart.getTotalDiscount() != null ? cart.getTotalDiscount() : BigDecimal.ZERO;
        return subtotal.subtract(totalDiscount);
    }

    /**
     * Create a new cart from helper DTO - pure MapStruct mapping
     */
    @Mapping(source = "userId", target = "userId")
    Cart createFromHelper(CartCreateHelper helper);
}
