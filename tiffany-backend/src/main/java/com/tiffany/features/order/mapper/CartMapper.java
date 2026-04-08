package com.tiffany.features.order.mapper;

import com.tiffany.features.order.dto.helper.CartCreateHelper;
import com.tiffany.features.order.dto.response.CartItemResponse;
import com.tiffany.features.order.dto.response.CartResponse;
import com.tiffany.features.order.dto.response.CartSummaryResponse;
import com.tiffany.features.order.models.Cart;
import com.tiffany.features.order.models.CartItem;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.mapper.PaginationMapper;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring", uses = {PaginationMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CartMapper {

    @Mapping(target = "productId", source = "productId")
    @Mapping(target = "productSizeId", source = "productSizeId")
    @Mapping(target = "sizeName", source = "sizeName")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "currentPriceBeforeDiscount", expression = "java(cartItem.getCurrentPrice())")
    @Mapping(target = "currentPriceAfterDiscount", expression = "java(cartItem.getFinalPrice())")
    @Mapping(target = "subtotalAfterDiscount", expression = "java(cartItem.getTotalPrice())")
    @Mapping(target = "hasDiscount", expression = "java(cartItem.hasDiscount())")
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
        if (response.getHasDiscount() != null && response.getHasDiscount()) {
            if (cartItem.getProductSize() != null && cartItem.getProductSize().isPromotionActive()) {
                response.setDiscountType(cartItem.getProductSize().getPromotionType() != null ?
                        cartItem.getProductSize().getPromotionType().toString() : null);
                calculateDiscountAmount(response);
            } else if (cartItem.getProduct() != null && cartItem.getProduct().isPromotionActive()) {
                response.setDiscountType(cartItem.getProduct().getPromotionType() != null ?
                        cartItem.getProduct().getPromotionType().toString() : null);
                calculateDiscountAmount(response);
            }
        }
    }

    @AfterMapping
    default void calculatePricingBreakdown(@MappingTarget CartItemResponse response, CartItem cartItem) {
        if (response.getCurrentPriceBeforeDiscount() != null && response.getQuantity() != null) {
            BigDecimal subtotalBeforeDiscount = response.getCurrentPriceBeforeDiscount()
                    .multiply(new BigDecimal(response.getQuantity()));
            response.setSubtotalBeforeDiscount(subtotalBeforeDiscount);

            if (response.getSubtotalAfterDiscount() != null) {
                BigDecimal subtotalDiscountAmount = subtotalBeforeDiscount.subtract(response.getSubtotalAfterDiscount());
                response.setSubtotalDiscountAmount(subtotalDiscountAmount);

                if (response.getCurrentPriceBeforeDiscount().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal itemDiscountAmount = response.getCurrentPriceBeforeDiscount()
                            .subtract(response.getCurrentPriceAfterDiscount());
                    response.setDiscountAmountPerItem(itemDiscountAmount);
                }
            }
        }
    }

    default void calculateDiscountAmount(CartItemResponse response) {
        if (response.getCurrentPriceBeforeDiscount() != null && response.getCurrentPriceAfterDiscount() != null) {
            BigDecimal discountAmount = response.getCurrentPriceBeforeDiscount()
                    .subtract(response.getCurrentPriceAfterDiscount());
            response.setDiscountAmountPerItem(discountAmount);

            if ("PERCENTAGE".equals(response.getDiscountType()) && response.getCurrentPriceBeforeDiscount().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal discountPercent = discountAmount
                        .divide(response.getCurrentPriceBeforeDiscount(), 2, java.math.RoundingMode.HALF_UP)
                        .multiply(new BigDecimal(100));
                response.setDiscountPercentage(discountPercent);
            }
        }
    }

    List<CartItemResponse> toItemResponseList(List<CartItem> cartItems);
    List<CartResponse> toResponseList(List<Cart> carts);

    @Mapping(target = "totalItems", expression = "java(cart.getTotalItems())")
    @Mapping(target = "subtotal", expression = "java(cart.getSubtotal())")
    @Mapping(target = "totalDiscount", expression = "java(cart.getTotalDiscount())")
    @Mapping(target = "finalTotal", expression = "java(cart.getSubtotal())")
    CartResponse toResponse(Cart cart);

    @AfterMapping
    default void setCartItems(@MappingTarget CartResponse response, Cart cart) {
        if (cart.getItems() != null) {
            response.setItems(toItemResponseList(cart.getItems()));
        }
    }

    default PaginationResponse<CartResponse> toPaginationResponse(Page<Cart> cartPage, PaginationMapper paginationMapper) {
return paginationMapper.toPaginationResponse(cartPage, this::toResponseList);
    }

    @Mapping(target = "totalItems", expression = "java(cart.getTotalItems())")
    @Mapping(target = "subtotal", expression = "java(cart.getSubtotal())")
    @Mapping(target = "totalDiscount", expression = "java(cart.getTotalDiscount())")
    @Mapping(target = "finalTotal", expression = "java(cart.getSubtotal())")
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
        }
    }

    /**
     * Create a new cart from helper DTO - pure MapStruct mapping
     */
    @Mapping(source = "userId", target = "userId")
    Cart createFromHelper(CartCreateHelper helper);
}
