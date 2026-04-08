package com.emenu.features.auth.dto.request;

import com.emenu.enums.user.UserType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialAuthRequest {

    @NotBlank(message = "Provider is required")
    private String provider;

    @NotBlank(message = "Access token is required")
    private String accessToken;

    @NotNull(message = "User type is required")
    private UserType userType;

    private String deviceInfo;
    private String ipAddress;
}
