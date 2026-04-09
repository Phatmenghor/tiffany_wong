package com.tiffany.features.location.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LocationImageRequest {
    @NotBlank(message = "Image URL cannot be empty")
    private String imageUrl; // Image URL or file path
}
