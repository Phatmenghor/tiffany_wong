package com.tiffany.features.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SocialMediaCreateRequest {

    @NotBlank(message = "Social media name is required")
    private String name;

    private String linkUrl;

    private String iconUrl;
}
