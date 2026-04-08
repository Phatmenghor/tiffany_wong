package com.tiffany.features.auth.service.impl;

import com.tiffany.features.auth.dto.helper.RefreshTokenCreateHelper;
import com.tiffany.features.auth.mapper.RefreshTokenMapper;
import com.tiffany.features.auth.models.RefreshToken;
import com.tiffany.features.auth.models.User;
import com.tiffany.features.auth.repository.RefreshTokenRepository;
import com.tiffany.features.auth.service.RefreshTokenService;
import com.tiffany.security.jwt.JWTGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JWTGenerator jwtGenerator;
    private final RefreshTokenMapper refreshTokenMapper;

    @Override
    @Transactional
    public RefreshToken createRefreshToken(User user, String ipAddress, String deviceInfo) {
        log.debug("Entering createRefreshToken: userId={}, identifier={}, userType={}",
                user.getId(), user.getUserIdentifier(), user.getUserType());

        log.info("Creating refresh token: userId={}, identifier={}, userType={}, ipAddress={}",
                user.getId(), user.getUserIdentifier(), user.getUserType(), ipAddress);

        // Generate JWT refresh token with userType
        String tokenString = jwtGenerator.generateRefreshToken(
                user.getUserIdentifier(),
                user.getUserType().name()
        );
        log.debug("JWT refresh token generated: userId={}, tokenLength={}",
                user.getId(), tokenString.length());

        // Build helper DTO, then use pure MapStruct mapping
        LocalDateTime expiryDate = LocalDateTime.ofInstant(
                jwtGenerator.getRefreshTokenExpiryDate().toInstant(),
                ZoneId.systemDefault());

        log.debug("Token expiry calculated: expiryDate={}", expiryDate);

        RefreshTokenCreateHelper helper = RefreshTokenCreateHelper.builder()
                .token(tokenString)
                .userId(user.getId())
                .expiryDate(expiryDate)
                .isRevoked(false)
                .ipAddress(ipAddress)
                .deviceInfo(deviceInfo)
                .build();

        RefreshToken refreshToken = refreshTokenMapper.createFromHelper(helper);
        RefreshToken saved = refreshTokenRepository.save(refreshToken);

        log.debug("Refresh token entity saved to database: id={}, userId={}, expiryDate={}",
                saved.getId(), saved.getUserId(), saved.getExpiryDate());

        log.info("Refresh token created successfully: userId={}, identifier={}, expiryDate={}, ipAddress={}",
                user.getId(), user.getUserIdentifier(), saved.getExpiryDate(), ipAddress);

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RefreshToken> verifyRefreshToken(String token) {
        log.debug("Entering verifyRefreshToken: tokenLength={}", token.length());

        // Validate JWT structure
        if (!jwtGenerator.validateToken(token)) {
            log.warn("Refresh token verification failed: Invalid JWT structure");
            return Optional.empty();
        }
        log.debug("JWT structure validation passed");

        // Check if token is expired in JWT
        if (jwtGenerator.isTokenExpired(token)) {
            log.warn("Refresh token verification failed: Token expired in JWT");
            return Optional.empty();
        }
        log.debug("JWT expiry validation passed");

        // Find token in database
        Optional<RefreshToken> refreshTokenOpt = refreshTokenRepository.findByTokenAndIsValidTrue(token);

        if (refreshTokenOpt.isEmpty()) {
            log.warn("Refresh token verification failed: Not found or invalid in database");
            return Optional.empty();
        }

        RefreshToken refreshToken = refreshTokenOpt.get();
        log.debug("Refresh token found in database: id={}, userId={}, expiryDate={}",
                refreshToken.getId(), refreshToken.getUserId(), refreshToken.getExpiryDate());

        // Additional validation
        if (!refreshToken.isValid()) {
            log.warn("Refresh token verification failed: Invalid state - userId={}, expired={}, revoked={}, deleted={}",
                    refreshToken.getUserId(), refreshToken.isExpired(), refreshToken.getIsRevoked(), refreshToken.getIsDeleted());
            return Optional.empty();
        }

        log.debug("Refresh token verified successfully: id={}, userId={}, expiryDate={}",
                refreshToken.getId(), refreshToken.getUserId(), refreshToken.getExpiryDate());
        return Optional.of(refreshToken);
    }

    @Override
    @Transactional
    public void revokeRefreshToken(String token, String reason) {
        log.debug("Entering revokeRefreshToken: reason={}, tokenLength={}", reason, token.length());

        Optional<RefreshToken> refreshTokenOpt = refreshTokenRepository.findByToken(token);

        if (refreshTokenOpt.isPresent()) {
            RefreshToken refreshToken = refreshTokenOpt.get();
            log.debug("Refresh token found for revocation: id={}, userId={}, reason={}",
                    refreshToken.getId(), refreshToken.getUserId(), reason);

            refreshToken.revoke(reason);
            refreshTokenRepository.save(refreshToken);

            log.info("Refresh token revoked successfully: id={}, userId={}, reason={}, revokedAt={}",
                    refreshToken.getId(), refreshToken.getUserId(), reason, refreshToken.getRevokedAt());
        } else {
            log.warn("Refresh token revocation failed: Token not found in database - reason={}", reason);
        }
    }

    @Override
    @Transactional
    public void revokeAllUserTokens(UUID userId, String reason) {
        log.debug("Entering revokeAllUserTokens: userId={}, reason={}", userId, reason);
        log.info("Revoking all refresh tokens for user: userId={}, reason={}", userId, reason);

        int revokedCount = refreshTokenRepository.revokeAllByUserId(
                userId,
                LocalDateTime.now(),
                reason
        );

        log.debug("Bulk token revocation completed: userId={}, revokedCount={}, reason={}",
                userId, revokedCount, reason);

        if (revokedCount > 0) {
            log.info("All refresh tokens revoked successfully: userId={}, revokedCount={}, reason={}",
                    userId, revokedCount, reason);
        } else {
            log.debug("No refresh tokens found to revoke: userId={}, reason={}", userId, reason);
        }
    }
}
