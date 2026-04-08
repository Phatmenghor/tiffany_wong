package com.emenu.features.auth.dto.update;

import com.emenu.features.auth.dto.request.BusinessHoursCreateRequest;
import com.emenu.features.auth.dto.request.SocialMediaCreateRequest;
import jakarta.validation.constraints.Email;
import lombok.Data;

import java.util.List;

@Data
public class SystemSettingUpdateRequest {

    // System Setting Fields
    private Double taxPercentage;
    private String systemName;
    private String logoSystemUrl;
    private String primaryColor;

    // Contact Information
    private String contactAddress;
    private String contactPhone;

    @Email(message = "Contact email must be valid")
    private String contactEmail;

    // Nested Collections - Smart Upsert Logic:
    // - Items with ID: update
    // - Items without ID: create
    // - Items marked null or removed from list: delete
    private List<SocialMediaCreateRequest> socialMediaList;
    private List<BusinessHoursCreateRequest> businessHoursList;
}
