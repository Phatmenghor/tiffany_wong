package com.tiffany.features.auth.service.impl;

import com.tiffany.enums.user.UserType;
import com.tiffany.exception.custom.ValidationException;
import com.tiffany.features.auth.dto.request.AdminPasswordResetRequest;
import com.tiffany.features.auth.dto.request.LoginRequest;
import com.tiffany.features.auth.dto.request.PasswordChangeRequest;
import com.tiffany.features.auth.dto.request.RefreshTokenRequest;
import com.tiffany.features.auth.dto.request.RegisterRequest;
import com.tiffany.features.auth.dto.response.LoginResponse;
import com.tiffany.features.auth.dto.response.RefreshTokenResponse;
import com.tiffany.features.auth.dto.response.UserResponse;
import com.tiffany.features.auth.mapper.UserMapper;
import com.tiffany.features.auth.models.RefreshToken;
import com.tiffany.features.auth.models.User;
import com.tiffany.features.auth.repository.UserRepository;
import com.tiffany.features.auth.service.AuthService;
import com.tiffany.features.auth.service.RefreshTokenService;
import com.tiffany.features.auth.service.UserValidationService;
import com.tiffany.security.SecurityUtils;
import com.tiffany.security.jwt.JWTGenerator;
import com.tiffany.security.jwt.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTGenerator jwtGenerator;
    private final SecurityUtils securityUtils;
    private final TokenBlacklistService tokenBlacklistService;
    private final RefreshTokenService refreshTokenService;
    private final UserValidationService userValidationService;

    /**
     * Authenticates a user and generates a JWT token with context-aware user lookup
     */
    @Override
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt: {} (userType: {})",
                request.getUserIdentifier(), request.getUserType());

        try {
            // Simple lookup by user identifier, validate userType matches
            User user = userRepository.findByUserIdentifierAndIsDeletedFalse(request.getUserIdentifier())
                    .orElseThrow(() -> new ValidationException("Invalid credentials"));

            // Validate userType matches
            if (!request.getUserType().equals(user.getUserType())) {
                throw new ValidationException("Invalid credentials");
            }

            // Authenticate with Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUserIdentifier(), request.getPassword())
            );

            // Validate account status
            securityUtils.validateAccountStatus(user);

            // Generate access token
            String accessToken = jwtGenerator.generateAccessToken(authentication);

            // Generate refresh token
            String ipAddress = getClientIpAddress();
            String deviceInfo = getDeviceInfo();
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, ipAddress, deviceInfo);

            // Build login response
            LoginResponse response = userMapper.toLoginResponse(user, accessToken);
            response.setRefreshToken(refreshToken.getToken());

            log.info("Login successful: {} (type: {})",
                    user.getUserIdentifier(), user.getUserType());
            return response;

        } catch (ValidationException e) {
            log.warn("Login failed: {} - Reason: {}", request.getUserIdentifier(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.warn("Login failed: {} - Error: {}", request.getUserIdentifier(), e.getMessage());
            throw new ValidationException("Invalid credentials");
        }
    }


    /**
     * Registers a new customer user
     */
    @Override
    public UserResponse registerCustomer(RegisterRequest request) {
        log.info("Customer registration: {}", request.getUserIdentifier());

        // Validate username uniqueness for CUSTOMER type (global uniqueness among customers)
        userValidationService.validateUsernameUniqueness(
                request.getUserIdentifier(),
                UserType.CUSTOMER
        );

        User user = userMapper.toEntity(request);
        user.setUserType(UserType.CUSTOMER);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        log.info("Customer registered: {}", savedUser.getUserIdentifier());
        return userMapper.toResponse(savedUser);
    }

    /**
     * Logs out a user by blacklisting their JWT token and revoking refresh token
     */
    @Override
    public void logout(String authorizationHeader) {
        log.info("Processing logout");
        String token = extractToken(authorizationHeader);

        if (token == null || !jwtGenerator.validateToken(token)) {
            throw new ValidationException("Invalid token");
        }

        String userIdentifier = jwtGenerator.getUsernameFromJWT(token);

        // Blacklist access token
        tokenBlacklistService.blacklistToken(token, userIdentifier, "LOGOUT");

        // Revoke all refresh tokens for the user
        User user = userRepository.findByUserIdentifierAndIsDeletedFalse(userIdentifier)
                .orElseThrow(() -> new ValidationException("User not found"));
        refreshTokenService.revokeAllUserTokens(user.getId(), "LOGOUT");

        log.info("Logout successful: {}", userIdentifier);
    }

    /**
     * Changes the password for the currently authenticated user
     */
    @Override
    public UserResponse changePassword(PasswordChangeRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new ValidationException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Password confirmation does not match");
        }

        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        User savedUser = userRepository.save(currentUser);

        // Blacklist all access tokens
        tokenBlacklistService.blacklistAllUserTokens(currentUser.getUserIdentifier(), "PASSWORD_CHANGE");

        // Revoke all refresh tokens
        refreshTokenService.revokeAllUserTokens(currentUser.getId(), "PASSWORD_CHANGE");

        log.info("Password changed: {}", currentUser.getUserIdentifier());

        return userMapper.toResponse(savedUser);
    }

    /**
     * Resets a user's password (admin function)
     */
    @Override
    public UserResponse adminResetPassword(AdminPasswordResetRequest request) {
        log.info("Admin password reset: {}", request.getUserId());

        User user = userRepository.findByIdAndIsDeletedFalse(request.getUserId())
                .orElseThrow(() -> new ValidationException("User not found"));

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Password confirmation does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        User savedUser = userRepository.save(user);

        // Blacklist all access tokens
        tokenBlacklistService.blacklistAllUserTokens(user.getUserIdentifier(), "ADMIN_PASSWORD_RESET");

        // Revoke all refresh tokens
        refreshTokenService.revokeAllUserTokens(user.getId(), "ADMIN_PASSWORD_RESET");

        log.info("Admin password reset: {}", user.getUserIdentifier());

        return userMapper.toResponse(savedUser);
    }

    private String extractToken(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7).trim();
        }
        return null;
    }

    /**
     * Get HttpServletRequest from RequestContextHolder
     */
    private HttpServletRequest getHttpServletRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                return attributes.getRequest();
            }
        } catch (Exception e) {
            log.warn("Failed to get HttpServletRequest", e);
        }
        return null;
    }

    /**
     * Get client IP address from request
     */
    private String getClientIpAddress() {
        HttpServletRequest request = getHttpServletRequest();
        if (request != null) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
        return "Unknown";
    }

    /**
     * Get device info from request
     */
    private String getDeviceInfo() {
        HttpServletRequest request = getHttpServletRequest();
        if (request != null) {
            return request.getHeader("User-Agent");
        }
        return "Unknown";
    }

    /**
     * Refresh access token using refresh token
     */
    @Override
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        String refreshTokenString = request.getRefreshToken();

        // Verify refresh token JWT structure first
        if (!jwtGenerator.validateToken(refreshTokenString)) {
            throw new ValidationException("Invalid refresh token");
        }

        // Extract user context from refresh token JWT
        String userIdentifier = jwtGenerator.getUsernameFromJWT(refreshTokenString);
        String userTypeStr = jwtGenerator.getUserTypeFromJWT(refreshTokenString);

        log.info("Refresh token context: userIdentifier={}, userType={}",
                userIdentifier, userTypeStr);

        // Verify refresh token exists in database and is valid
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenString)
                .orElseThrow(() -> new ValidationException("Invalid or expired refresh token"));

        // Find user using context from refresh token JWT
        User user = findUserByRefreshTokenContext(userIdentifier, userTypeStr);

        // Validate that the found user matches the refresh token's userId
        if (!user.getId().equals(refreshToken.getUserId())) {
            log.error("Security: User ID mismatch! Token userId={}, Found userId={}",
                    refreshToken.getUserId(), user.getId());
            throw new ValidationException("Invalid refresh token");
        }

        // Validate account status
        securityUtils.validateAccountStatus(user);

        // Generate new access token
        String newAccessToken = jwtGenerator.generateAccessTokenFromUsername(user.getUserIdentifier(), java.util.Collections.emptyList());

        // Generate a new refresh token (rotate refresh tokens for better security)
        String ipAddress = getClientIpAddress();
        String deviceInfo = getDeviceInfo();
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user, ipAddress, deviceInfo);

        // Revoke old refresh token
        refreshTokenService.revokeRefreshToken(refreshTokenString, "TOKEN_REFRESH");

        log.info("Token refresh successful: {} (type: {})",
                user.getUserIdentifier(), user.getUserType());

        return new RefreshTokenResponse(newAccessToken, newRefreshToken.getToken());
    }

    /**
     * Find user by refresh token context (userIdentifier, userType)
     */
    private User findUserByRefreshTokenContext(String userIdentifier, String userTypeStr) {
        if (userTypeStr == null) {
            throw new ValidationException("Invalid refresh token: missing user type");
        }

        UserType userType;
        try {
            userType = UserType.valueOf(userTypeStr);
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid refresh token: invalid user type");
        }

        // Simple lookup by userIdentifier
        return userRepository.findByUserIdentifierAndIsDeletedFalse(userIdentifier)
                .orElseThrow(() -> new ValidationException("User not found for refresh token context"));
    }
}