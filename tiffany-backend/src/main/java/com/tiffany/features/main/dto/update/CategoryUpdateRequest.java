package com.tiffany.features.main.dto.update;

import com.tiffany.enums.common.Status;
import lombok.Data;

@Data
public class CategoryUpdateRequest {
    private String name;
    private String imageUrl;
    private Status status;
}