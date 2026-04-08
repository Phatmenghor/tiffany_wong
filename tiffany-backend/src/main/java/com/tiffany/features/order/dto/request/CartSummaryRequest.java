package com.tiffany.features.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartSummaryRequest {

    @Valid
    @NotNull(message = "Cart items are required")
    private List<CartItemCreateRequest> items;
}
