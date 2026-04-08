package com.tiffany.features.main.dto.response;

import com.tiffany.enums.common.Status;
import com.tiffany.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class BannerResponse extends BaseAuditResponse {
    private String imageUrl;
    private String description;
    private String linkUrl;
    private Status status;
}
