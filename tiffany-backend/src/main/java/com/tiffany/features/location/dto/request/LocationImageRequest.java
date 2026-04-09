package com.tiffany.features.location.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class LocationImageRequest {
    private UUID id; // Optional - if present, this is an update; if null, this is a create

    @NotBlank(message = "Image URL cannot be empty")
    private String imageUrl; // Image URL or file path

    private Boolean isDeleted = false; // If true, mark this image for deletion
}
