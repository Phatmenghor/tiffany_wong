package com.tiffany.features.location.dto.response;

import com.tiffany.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class LocationImageResponse extends BaseAuditResponse {
    private UUID locationId;
    private String imageUrl;
}
