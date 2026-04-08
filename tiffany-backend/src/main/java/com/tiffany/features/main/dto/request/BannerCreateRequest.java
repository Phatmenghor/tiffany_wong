package com.tiffany.features.main.dto.request;

import com.tiffany.enums.common.Status;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BannerCreateRequest {

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    private String description;
    private String linkUrl;
    private Status status = Status.ACTIVE;
}
