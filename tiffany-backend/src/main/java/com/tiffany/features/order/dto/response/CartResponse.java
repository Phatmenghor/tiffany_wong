package com.tiffany.features.order.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CartResponse {
    private UUID userId;
    private List<CartItemResponse> items;
    private Integer totalItems;
    private BigDecimal subtotal;
    private BigDecimal totalDiscount;
    private BigDecimal finalTotal;
}