package com.tiffany.features.auth.dto.response;

import com.tiffany.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class SystemSettingResponse extends BaseAuditResponse {

    private UUID id;
    private Double taxPercentage;
    private String systemName;
    private String logoSystemUrl;
    private String primaryColor;
    private String contactAddress;
    private String contactPhone;
    private String contactEmail;
    private List<SocialMediaResponse> socialMedia;
    private List<BusinessHoursResponse> businessHours;
}
