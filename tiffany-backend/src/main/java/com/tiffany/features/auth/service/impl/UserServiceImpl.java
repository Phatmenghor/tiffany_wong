package com.tiffany.features.auth.service.impl;

import com.tiffany.enums.user.AccountStatus;
import com.tiffany.enums.user.UserType;
import com.tiffany.exception.custom.ValidationException;
import com.tiffany.features.auth.dto.filter.UserFilterRequest;
import com.tiffany.features.auth.dto.request.*;
import com.tiffany.features.auth.dto.response.UserDetailResponse;
import com.tiffany.features.auth.dto.response.UserResponse;
import com.tiffany.features.auth.dto.update.UserUpdateRequest;
import com.tiffany.features.auth.mapper.UserMapper;
import com.tiffany.features.auth.models.*;
import com.tiffany.features.auth.repository.UserRepository;
import com.tiffany.features.auth.service.UserService;
import com.tiffany.security.SecurityUtils;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.mapper.PaginationMapper;
import com.tiffany.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;
    private final PaginationMapper paginationMapper;

    @Override
    public UserResponse createUser(UserCreateRequest req) {
        log.debug("Entering createUser: identifier={}, userType={}", req.getUserIdentifier(), req.getUserType());
        log.info("User creation attempt: identifier={}, userType={}", req.getUserIdentifier(), req.getUserType());

        boolean userExists = userRepository.existsByUserIdentifierAndIsDeletedFalse(req.getUserIdentifier());
        log.debug("User identifier uniqueness check: identifier={}, exists={}", req.getUserIdentifier(), userExists);

        if (userExists) {
            log.warn("User creation failed: Identifier already exists - identifier={}", req.getUserIdentifier());
            throw new ValidationException("User identifier already exists");
        }

        User user = userMapper.toEntity(req);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        User saved = userRepository.save(user);

        log.debug("User entity created and saved: id={}, identifier={}, type={}, status={}",
                saved.getId(), saved.getUserIdentifier(), saved.getUserType(), saved.getAccountStatus());

        // Profile
        UserProfile profile = new UserProfile();
        profile.setUser(saved);
        profile.setEmail(req.getEmail());
        profile.setFirstName(req.getFirstName());
        profile.setLastName(req.getLastName());
        profile.setNickname(req.getNickname());
        profile.setGender(req.getGender());
        profile.setDateOfBirth(req.getDateOfBirth());
        profile.setPhoneNumber(req.getPhoneNumber());
        profile.setProfileImageUrl(req.getProfileImageUrl());
        saved.setProfile(profile);

        saved = userRepository.save(saved);

        log.debug("User profile created: id={}, email={}, name={} {}",
                saved.getId(), profile.getEmail(), profile.getFirstName(), profile.getLastName());

        log.info("User created successfully: id={}, identifier={}, userType={}, accountStatus={}",
                saved.getId(), saved.getUserIdentifier(), saved.getUserType(), saved.getAccountStatus());
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<UserResponse> getAllUsers(UserFilterRequest request) {
        log.debug("Entering getAllUsers: pageNo={}, pageSize={}, sortBy={}, sortDirection={}",
                request.getPageNo(), request.getPageSize(), request.getSortBy(), request.getSortDirection());

        log.debug("Filters applied: userTypes={}, accountStatuses={}, roles={}, search={}",
                request.getUserTypes(), request.getAccountStatuses(), request.getRoles(), request.getSearch());

        Pageable pageable = PaginationUtils.createPageable(
                request.getPageNo(), request.getPageSize(), request.getSortBy(), request.getSortDirection());

        Page<User> page = userRepository.searchUsers(
                (request.getUserTypes() != null && !request.getUserTypes().isEmpty()) ? request.getUserTypes() : null,
                (request.getAccountStatuses() != null && !request.getAccountStatuses().isEmpty()) ? request.getAccountStatuses() : null,
                (request.getRoles() != null && !request.getRoles().isEmpty()) ? request.getRoles() : null,
                request.getSearch(),
                pageable);

        log.info("Users fetched: totalElements={}, totalPages={}, currentPage={}, pageSize={}",
                page.getTotalElements(), page.getTotalPages(), page.getNumber(), page.getSize());

        return userMapper.toPaginationResponse(page, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getUserById(UUID userId) {
        log.debug("Entering getUserById: userId={}", userId);

        return userMapper.toDetailResponse(userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> {
                    log.warn("User retrieval failed: User not found - userId={}", userId);
                    return new RuntimeException("User not found");
                }));
    }

    @Override
    public UserResponse updateUser(UUID userId, UserUpdateRequest req) {
        log.debug("Entering updateUser: userId={}", userId);
        log.info("User update initiated: userId={}", userId);

        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> {
                    log.warn("User update failed: User not found - userId={}", userId);
                    return new RuntimeException("User not found");
                });

        log.debug("User found for update: id={}, identifier={}, currentStatus={}",
                user.getId(), user.getUserIdentifier(), user.getAccountStatus());

        userMapper.updateEntity(req, user);
        log.debug("User entity updated from request: userId={}",userId);

        // Profile
        UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
            user.setProfile(profile);
            log.debug("New profile created: userId={}", userId);
        }

        if (req.getEmail() != null) {
            log.debug("Email updated: userId={}, oldEmail={}, newEmail={}", userId, profile.getEmail(), req.getEmail());
            profile.setEmail(req.getEmail());
        }
        if (req.getFirstName() != null) profile.setFirstName(req.getFirstName());
        if (req.getLastName() != null) profile.setLastName(req.getLastName());
        if (req.getNickname() != null) profile.setNickname(req.getNickname());
        if (req.getGender() != null) profile.setGender(req.getGender());
        if (req.getDateOfBirth() != null) profile.setDateOfBirth(req.getDateOfBirth());
        if (req.getPhoneNumber() != null) profile.setPhoneNumber(req.getPhoneNumber());
        if (req.getProfileImageUrl() != null) profile.setProfileImageUrl(req.getProfileImageUrl());

        User updated = userRepository.save(user);

        log.debug("User entity persisted: id={}, identifier={}, status={}",
                updated.getId(), updated.getUserIdentifier(), updated.getAccountStatus());

        log.info("User updated successfully: id={}, identifier={}, accountStatus={}",
                updated.getId(), updated.getUserIdentifier(), updated.getAccountStatus());
        return userMapper.toResponse(updated);
    }

    @Override
    public UserResponse deleteUser(UUID userId) {
        log.debug("Entering deleteUser: userId={}", userId);

        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> {
                    log.warn("User deletion failed: User not found - userId={}", userId);
                    return new RuntimeException("User not found");
                });

        log.debug("User found for deletion: id={}, identifier={}, status={}", user.getId(), user.getUserIdentifier(), user.getAccountStatus());

        User currentUser = securityUtils.getCurrentUser();
        if (user.getId().equals(currentUser.getId())) {
            log.warn("User deletion failed: Self-deletion attempt - userId={}, currentUserId={}", userId, currentUser.getId());
            throw new ValidationException("You cannot delete your own account");
        }

        log.debug("Authorization check passed: targetUserId={}, requestorUserId={}, requestorIdentifier={}",
                userId, currentUser.getId(), currentUser.getUserIdentifier());

        user.softDelete();
        User deleted = userRepository.save(user);

        log.info("User deleted successfully: id={}, identifier={}, deletedBy={}, deletedByIdentifier={}",
                deleted.getId(), deleted.getUserIdentifier(), currentUser.getId(), currentUser.getUserIdentifier());
        return userMapper.toResponse(deleted);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        log.debug("Entering getCurrentUser");
        User currentUser = securityUtils.getCurrentUser();
        log.debug("Current user retrieved: id={}, identifier={}, userType={}, status={}",
                currentUser.getId(), currentUser.getUserIdentifier(), currentUser.getUserType(), currentUser.getAccountStatus());
        return userMapper.toResponse(currentUser);
    }

    /**
     * Updates the current authenticated user's profile.
     * Convenience method that extracts the current user ID and calls updateUser.
     */
    @Override
    @Transactional
    public UserResponse updateCurrentUser(UserUpdateRequest request) {
        log.debug("Entering updateCurrentUser");
        User currentUser = securityUtils.getCurrentUser();
        log.debug("Current user extracted for update: id={}, identifier={}, status={}",
                currentUser.getId(), currentUser.getUserIdentifier(), currentUser.getAccountStatus());
        log.info("Current user update initiated: id={}, identifier={}",
                currentUser.getId(), currentUser.getUserIdentifier());
        return updateUser(currentUser.getId(), request);
    }
}
