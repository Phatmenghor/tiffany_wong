package com.tiffany.features.auth.dto.update;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class SystemSettingUpdateRequest {

    private String description;

    // Contact Information
    private String contactAddress;
    private String contactPhone;

    @Email(message = "Contact email must be valid")
    private String contactEmail;

    // Social Media Links
    private String facebookUrl;
    private String instagramUrl;
    private String telegramUrl;
}
