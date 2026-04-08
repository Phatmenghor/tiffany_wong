package com.tiffany.features.main.dto.response;

import com.tiffany.enums.common.Status;
import com.tiffany.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class CategoryResponse extends BaseAuditResponse {
    private String name;
    private String imageUrl;
    private Status status;
}
