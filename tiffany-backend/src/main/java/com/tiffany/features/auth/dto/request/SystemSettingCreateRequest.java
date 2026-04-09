package com.tiffany.features.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SystemSettingCreateRequest {

    private Double taxPercentage;

    @NotBlank(message = "System name is required")
    private String systemName;

    private String description;

    private String logoSystemUrl;

    private String primaryColor;

    // Contact Information
    private String contactAddress;

    private String contactPhone;

    @Email(message = "Contact email must be valid")
    private String contactEmail;
}
