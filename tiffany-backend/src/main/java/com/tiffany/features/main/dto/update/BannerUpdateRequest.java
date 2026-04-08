package com.tiffany.features.main.dto.update;

import com.tiffany.enums.common.Status;
import lombok.Data;

@Data
public class BannerUpdateRequest {
    private String imageUrl;
    private String description;
    private String linkUrl;
    private Status status;
}