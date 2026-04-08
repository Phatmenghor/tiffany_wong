package com.emenu.features.auth.dto.response;

import com.emenu.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

/**
 * Social Media Response DTO
 * Represents a social media account linked to system settings
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class SocialMediaResponse extends BaseAuditResponse {
    private UUID id;
    private UUID systemSettingId;
    private String name;       // e.g., "Facebook", "Instagram"
    private String linkUrl;    // Link to the social media profile
}
