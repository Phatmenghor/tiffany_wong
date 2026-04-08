package com.tiffany.features.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BusinessHoursCreateRequest {

    @NotBlank(message = "Day is required")
    private String day;

    private String openingTime;

    private String closingTime;
}
