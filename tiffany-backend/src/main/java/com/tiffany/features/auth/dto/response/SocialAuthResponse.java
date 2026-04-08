package com.tiffany.features.auth.dto.response;

import com.tiffany.enums.user.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialAuthResponse {

    private boolean success;
    private String message;
    private String provider;

    private UUID userId;
    private String userIdentifier;
    private String userType;
    private UserRole userRole;

    private String accessToken;
    private String refreshToken;
}
