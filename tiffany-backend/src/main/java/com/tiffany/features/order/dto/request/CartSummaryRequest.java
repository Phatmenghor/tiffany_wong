package com.tiffany.features.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartSummaryRequest {

    @Valid
    @NotNull(message = "Cart items are required")
    private List<CartItemCreateRequest> items;

    private Integer totalItems;                  // Total number of unique products
    private Integer totalQuantity;               // Total quantity across all items
    private BigDecimal subtotalBeforeDiscount;  // Sum of all items at original price
    private BigDecimal subtotal;                 // Sum of all items after discount
    private BigDecimal totalDiscount;            // Total discount on all items
    private BigDecimal finalTotal;               // subtotal + fees (delivery, tax)
}
