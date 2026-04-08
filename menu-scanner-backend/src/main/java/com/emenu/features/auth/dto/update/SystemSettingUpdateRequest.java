package com.emenu.features.auth.dto.update;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class SystemSettingUpdateRequest {

    private Double taxPercentage;

    private String systemName;

    private String logoSystemUrl;

    private String primaryColor;

    // Contact Information
    private String contactAddress;

    private String contactPhone;

    @Email(message = "Contact email must be valid")
    private String contactEmail;
}
