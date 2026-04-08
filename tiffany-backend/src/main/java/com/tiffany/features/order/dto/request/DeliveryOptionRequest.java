package com.tiffany.features.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOptionRequest {

    @NotBlank(message = "Delivery option name is required")
    private String name;

    private String description;

    private String imageUrl;

    @NotNull(message = "Delivery price is required")
    private BigDecimal price;
}
