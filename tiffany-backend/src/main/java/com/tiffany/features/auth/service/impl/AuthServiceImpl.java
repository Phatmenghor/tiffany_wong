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
        log.debug("Entering login: identifier={}, userType={}",
                request.getUserIdentifier(), request.getUserType());

        log.info("Login attempt: identifier={}, userType={}, ipAddress={}",
                request.getUserIdentifier(), request.getUserType(), getClientIpAddress());

        User user = userRepository.findByUserIdentifierAndIsDeletedFalse(request.getUserIdentifier())
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found - identifier={}", request.getUserIdentifier());
                    return new ValidationException("Invalid credentials");
                });

        if (!request.getUserType().equals(user.getUserType())) {
            log.warn("Login failed: User type mismatch - identifier={}, requestType={}, userType={}",
                    request.getUserIdentifier(), request.getUserType(), user.getUserType());
            throw new ValidationException("Invalid credentials");
        }

        log.debug("User found for authentication: id={}, identifier={}, type={}, status={}",
                user.getId(), user.getUserIdentifier(), user.getUserType(), user.getAccountStatus());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUserIdentifier(), request.getPassword())
            );
            log.debug("Authentication successful: identifier={}, principal={}",
                    request.getUserIdentifier(), authentication.getName());
        } catch (Exception e) {
            log.warn("Login failed: Authentication error - identifier={}, exception={}",
                    request.getUserIdentifier(), e.getMessage());
            throw new ValidationException("Invalid credentials");
        }

        try {
            securityUtils.validateAccountStatus(user);
            log.debug("Account status validation passed: id={}, status={}",
                    user.getId(), user.getAccountStatus());
        } catch (Exception e) {
            log.warn("Login failed: Account status validation - id={}, status={}, exception={}",
                    user.getId(), user.getAccountStatus(), e.getMessage());
            throw e;
        }

        String accessToken = jwtGenerator.generateAccessToken(authentication);
        log.debug("Access token generated: identifier={}, tokenLength={}",
                request.getUserIdentifier(), accessToken.length());

        String ipAddress = getClientIpAddress();
        String deviceInfo = getDeviceInfo();
        log.debug("Device info captured: ipAddress={}, deviceInfo={}", ipAddress, deviceInfo);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, ipAddress, deviceInfo);
        log.debug("Refresh token created: id={}, expiryDate={}",
                user.getId(), refreshToken.getExpiryDate());

        LoginResponse response = userMapper.toLoginResponse(user, accessToken);
        response.setRefreshToken(refreshToken.getToken());

        log.info("Login successful: id={}, identifier={}, userType={}, status={}, ipAddress={}",
                user.getId(), user.getUserIdentifier(), user.getUserType(), user.getAccountStatus(), ipAddress);
        return response;
    }


    /**
     * Registers a new customer user
     */
    @Override
    public UserResponse registerCustomer(RegisterRequest request) {
        log.debug("Entering registerCustomer: identifier={}", request.getUserIdentifier());
        log.info("Customer registration attempt: identifier={}",
                request.getUserIdentifier());

        // Validate username uniqueness for CUSTOMER type (global uniqueness among customers)
        try {
            userValidationService.validateUsernameUniqueness(
                    request.getUserIdentifier(),
                    UserType.CUSTOMER
            );
            log.debug("Username uniqueness validated: identifier={}, type={}",
                    request.getUserIdentifier(), UserType.CUSTOMER);
        } catch (Exception e) {
            log.warn("Registration failed: Username validation - identifier={}, exception={}",
                    request.getUserIdentifier(), e.getMessage());
            throw e;
        }

        User user = userMapper.toEntity(request);
        user.setUserType(UserType.CUSTOMER);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        log.debug("User entity created and saved: id={}, identifier={}, type={}, status={}",
                savedUser.getId(), savedUser.getUserIdentifier(), savedUser.getUserType(), savedUser.getAccountStatus());

        log.info("Customer registered successfully: id={}, identifier={}, accountStatus={}",
                savedUser.getId(), savedUser.getUserIdentifier(), savedUser.getAccountStatus());
        return userMapper.toResponse(savedUser);
    }

    /**
     * Logs out a user by blacklisting their JWT token and revoking refresh token
     */
    @Override
    public void logout(String authorizationHeader) {
        log.debug("Entering logout: processing authorization header");

        String token = extractToken(authorizationHeader);
        log.debug("Token extracted: tokenPresent={}", token != null);

        if (token == null) {
            log.warn("Logout failed: No bearer token provided in authorization header");
            throw new ValidationException("Invalid token");
        }

        if (!jwtGenerator.validateToken(token)) {
            log.warn("Logout failed: Invalid token structure or signature");
            throw new ValidationException("Invalid token");
        }

        String userIdentifier = jwtGenerator.getUsernameFromJWT(token);
        log.debug("User extracted from token: identifier={}", userIdentifier);

        // Blacklist access token
        tokenBlacklistService.blacklistToken(token, userIdentifier, "LOGOUT");
        log.debug("Access token blacklisted: identifier={}, reason=LOGOUT", userIdentifier);

        // Revoke all refresh tokens for the user
        User user = userRepository.findByUserIdentifierAndIsDeletedFalse(userIdentifier)
                .orElseThrow(() -> {
                    log.warn("Logout failed: User not found - identifier={}", userIdentifier);
                    return new ValidationException("User not found");
                });

        log.debug("User found for logout: id={}, identifier={}", user.getId(), user.getUserIdentifier());

        refreshTokenService.revokeAllUserTokens(user.getId(), "LOGOUT");
        log.debug("All refresh tokens revoked: id={}, reason=LOGOUT", user.getId());

        log.info("Logout successful: id={}, identifier={}, ipAddress={}",
                user.getId(), userIdentifier, getClientIpAddress());
    }

    /**
     * Changes the password for the currently authenticated user
     */
    @Override
    public UserResponse changePassword(PasswordChangeRequest request) {
        log.debug("Entering changePassword");
        User currentUser = securityUtils.getCurrentUser();
        log.debug("Current user retrieved: id={}, identifier={}", currentUser.getId(), currentUser.getUserIdentifier());

        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            log.warn("Password change failed: Current password mismatch - id={}, identifier={}",
                    currentUser.getId(), currentUser.getUserIdentifier());
            throw new ValidationException("Current password is incorrect");
        }
        log.debug("Current password verified: id={}", currentUser.getId());

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            log.warn("Password change failed: Confirmation mismatch - id={}",
                    currentUser.getId());
            throw new ValidationException("Password confirmation does not match");
        }
        log.debug("Password confirmation validated: id={}", currentUser.getId());

        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        User savedUser = userRepository.save(currentUser);
        log.debug("New password encoded and saved: id={}, identifier={}", savedUser.getId(), savedUser.getUserIdentifier());

        // Blacklist all access tokens
        tokenBlacklistService.blacklistAllUserTokens(currentUser.getUserIdentifier(), "PASSWORD_CHANGE");
        log.debug("All access tokens blacklisted: id={}, reason=PASSWORD_CHANGE", currentUser.getId());

        // Revoke all refresh tokens
        refreshTokenService.revokeAllUserTokens(currentUser.getId(), "PASSWORD_CHANGE");
        log.debug("All refresh tokens revoked: id={}, reason=PASSWORD_CHANGE", currentUser.getId());

        log.info("Password changed successfully: id={}, identifier={}, ipAddress={}",
                savedUser.getId(), savedUser.getUserIdentifier(), getClientIpAddress());

        return userMapper.toResponse(savedUser);
    }

    /**
     * Resets a user's password (admin function)
     */
    @Override
    public UserResponse adminResetPassword(AdminPasswordResetRequest request) {
        log.debug("Entering adminResetPassword: targetUserId={}", request.getUserId());
        User adminUser = securityUtils.getCurrentUser();
        log.debug("Admin user initiating reset: id={}, identifier={}, type={}",
                adminUser.getId(), adminUser.getUserIdentifier(), adminUser.getUserType());

        log.info("Admin password reset initiated: targetUserId={}, adminId={}, adminIdentifier={}",
                request.getUserId(), adminUser.getId(), adminUser.getUserIdentifier());

        User user = userRepository.findByIdAndIsDeletedFalse(request.getUserId())
                .orElseThrow(() -> {
                    log.warn("Admin password reset failed: Target user not found - targetUserId={}",
                            request.getUserId());
                    return new ValidationException("User not found");
                });

        log.debug("Target user found: id={}, identifier={}, type={}, status={}",
                user.getId(), user.getUserIdentifier(), user.getUserType(), user.getAccountStatus());

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            log.warn("Admin password reset failed: Confirmation mismatch - targetUserId={}",
                    request.getUserId());
            throw new ValidationException("Password confirmation does not match");
        }
        log.debug("Password confirmation validated: targetUserId={}", request.getUserId());

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        User savedUser = userRepository.save(user);
        log.debug("New password encoded and saved: targetUserId={}, identifier={}",
                savedUser.getId(), savedUser.getUserIdentifier());

        // Blacklist all access tokens
        tokenBlacklistService.blacklistAllUserTokens(user.getUserIdentifier(), "ADMIN_PASSWORD_RESET");
        log.debug("All access tokens blacklisted: targetUserId={}, reason=ADMIN_PASSWORD_RESET",
                user.getId());

        // Revoke all refresh tokens
        refreshTokenService.revokeAllUserTokens(user.getId(), "ADMIN_PASSWORD_RESET");
        log.debug("All refresh tokens revoked: targetUserId={}, reason=ADMIN_PASSWORD_RESET",
                user.getId());

        log.info("Admin password reset completed: targetUserId={}, targetIdentifier={}, adminId={}, adminIdentifier={}",
                savedUser.getId(), savedUser.getUserIdentifier(), adminUser.getId(), adminUser.getUserIdentifier());

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
        log.debug("Entering refreshToken");
        String refreshTokenString = request.getRefreshToken();

        // Verify refresh token JWT structure first
        if (!jwtGenerator.validateToken(refreshTokenString)) {
            log.warn("Token refresh failed: Invalid JWT structure");
            throw new ValidationException("Invalid refresh token");
        }
        log.debug("Refresh token JWT structure validated");

        // Extract user context from refresh token JWT
        String userIdentifier = jwtGenerator.getUsernameFromJWT(refreshTokenString);
        String userTypeStr = jwtGenerator.getUserTypeFromJWT(refreshTokenString);

        log.debug("Refresh token context extracted: userIdentifier={}, userType={}",
                userIdentifier, userTypeStr);
        log.info("Refresh token processing: identifier={}, userType={}, ipAddress={}",
                userIdentifier, userTypeStr, getClientIpAddress());

        // Verify refresh token exists in database and is valid
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenString)
                .orElseThrow(() -> {
                    log.warn("Token refresh failed: Invalid or expired refresh token - identifier={}",
                            userIdentifier);
                    return new ValidationException("Invalid or expired refresh token");
                });

        log.debug("Refresh token verified in database: userId={}, expiryDate={}",
                refreshToken.getUserId(), refreshToken.getExpiryDate());

        // Find user using context from refresh token JWT
        User user = findUserByRefreshTokenContext(userIdentifier, userTypeStr);
        log.debug("User found from token context: id={}, identifier={}, type={}",
                user.getId(), user.getUserIdentifier(), user.getUserType());

        // Validate that the found user matches the refresh token's userId
        if (!user.getId().equals(refreshToken.getUserId())) {
            log.error("Token refresh security violation: User ID mismatch! tokenUserId={}, foundUserId={}, identifier={}",
                    refreshToken.getUserId(), user.getId(), userIdentifier);
            throw new ValidationException("Invalid refresh token");
        }
        log.debug("User ID validation passed: id={}", user.getId());

        // Validate account status
        try {
            securityUtils.validateAccountStatus(user);
            log.debug("Account status validation passed: id={}, status={}",
                    user.getId(), user.getAccountStatus());
        } catch (Exception e) {
            log.warn("Token refresh failed: Account status validation - id={}, status={}, exception={}",
                    user.getId(), user.getAccountStatus(), e.getMessage());
            throw e;
        }

        // Generate new access token
        String newAccessToken = jwtGenerator.generateAccessTokenFromUsername(user.getUserIdentifier(), java.util.Collections.emptyList());
        log.debug("New access token generated: identifier={}, tokenLength={}",
                user.getUserIdentifier(), newAccessToken.length());

        // Generate a new refresh token (rotate refresh tokens for better security)
        String ipAddress = getClientIpAddress();
        String deviceInfo = getDeviceInfo();
        log.debug("New device context: ipAddress={}, deviceInfo={}", ipAddress, deviceInfo);

        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user, ipAddress, deviceInfo);
        log.debug("New refresh token created: userId={}, expiryDate={}",
                user.getId(), newRefreshToken.getExpiryDate());

        // Revoke old refresh token
        refreshTokenService.revokeRefreshToken(refreshTokenString, "TOKEN_REFRESH");
        log.debug("Old refresh token revoked: userId={}, reason=TOKEN_REFRESH",
                user.getId());

        log.info("Token refresh successful: id={}, identifier={}, userType={}, ipAddress={}",
                user.getId(), user.getUserIdentifier(), user.getUserType(), ipAddress);

        return new RefreshTokenResponse(newAccessToken, newRefreshToken.getToken());
    }

    /**
     * Find user by refresh token context (userIdentifier, userType)
     */
    private User findUserByRefreshTokenContext(String userIdentifier, String userTypeStr) {
        log.debug("Entering findUserByRefreshTokenContext: identifier={}, userTypeStr={}",
                userIdentifier, userTypeStr);

        if (userTypeStr == null) {
            log.warn("Token context lookup failed: Missing user type - identifier={}", userIdentifier);
            throw new ValidationException("Invalid refresh token: missing user type");
        }

        UserType userType;
        try {
            userType = UserType.valueOf(userTypeStr);
            log.debug("User type parsed: userTypeStr={}, userType={}", userTypeStr, userType);
        } catch (IllegalArgumentException e) {
            log.warn("Token context lookup failed: Invalid user type - identifier={}, userTypeStr={}",
                    userIdentifier, userTypeStr);
            throw new ValidationException("Invalid refresh token: invalid user type");
        }

        // Simple lookup by userIdentifier
        User user = userRepository.findByUserIdentifierAndIsDeletedFalse(userIdentifier)
                .orElseThrow(() -> {
                    log.warn("Token context lookup failed: User not found - identifier={}, userType={}",
                            userIdentifier, userType);
                    return new ValidationException("User not found for refresh token context");
                });

        log.debug("User found in token context: id={}, identifier={}, type={}",
                user.getId(), user.getUserIdentifier(), user.getUserType());
        return user;
    }
}