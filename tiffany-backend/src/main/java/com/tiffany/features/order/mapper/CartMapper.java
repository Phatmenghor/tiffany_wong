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
            response.setDisplayPromotionValue(cartItem.getProductSize().getPromotionValue());
            response.setDisplayPromotionFromDate(cartItem.getProductSize().getPromotionFromDate());
            response.setDisplayPromotionToDate(cartItem.getProductSize().getPromotionToDate());
            response.setHasActivePromotion(true);
        } else if (cartItem.getProduct() != null && cartItem.getProduct().isPromotionActive()) {
            response.setDisplayPromotionType(cartItem.getProduct().getPromotionType() != null ?
                    cartItem.getProduct().getPromotionType().toString() : null);
            response.setDisplayPromotionValue(cartItem.getProduct().getPromotionValue());
            response.setDisplayPromotionFromDate(cartItem.getProduct().getPromotionFromDate());
            response.setDisplayPromotionToDate(cartItem.getProduct().getPromotionToDate());
            response.setHasActivePromotion(true);
        } else {
            response.setHasActivePromotion(false);
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
    @Mapping(target = "subtotal", expression = "java(cart.getSubtotal())")
    @Mapping(target = "totalDiscount", expression = "java(cart.getTotalDiscount())")
    @Mapping(target = "finalTotal", expression = "java(calculateFinalTotal(cart))")
    CartSummaryResponse toSummaryResponse(Cart cart);

    @AfterMapping
    default void setSummaryCartItems(@MappingTarget CartSummaryResponse response, Cart cart) {
        if (cart.getItems() != null) {
            response.setItems(toItemResponseList(cart.getItems()));
            // Calculate total quantity (sum of all item quantities)
            int totalQuantity = cart.getItems().stream()
                    .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                    .sum();
            response.setTotalQuantity(totalQuantity);

            // Calculate subtotal before discount (sum of all item subtotals before discount)
            BigDecimal subtotalBeforeDiscount = cart.getItems().stream()
                    .map(item -> {
                        BigDecimal price = item.getCurrentPrice() != null ? item.getCurrentPrice() : BigDecimal.ZERO;
                        int qty = item.getQuantity() != null ? item.getQuantity() : 0;
                        return price.multiply(new BigDecimal(qty));
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            response.setSubtotalBeforeDiscount(subtotalBeforeDiscount);
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
