package com.emenu.features.auth.service.impl;

import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.UserType;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.dto.filter.UserFilterRequest;
import com.emenu.features.auth.dto.request.*;
import com.emenu.features.auth.dto.response.UserDetailResponse;
import com.emenu.features.auth.dto.response.UserResponse;
import com.emenu.features.auth.dto.update.UserUpdateRequest;
import com.emenu.features.auth.mapper.UserMapper;
import com.emenu.features.auth.models.*;
import com.emenu.features.auth.repository.RoleRepository;
import com.emenu.features.auth.repository.UserRepository;
import com.emenu.features.auth.service.UserService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
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
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;
    private final com.emenu.shared.mapper.PaginationMapper paginationMapper;

    @Override
    public UserResponse createUser(UserCreateRequest req) {
        log.info("Creating user: {}", req.getUserIdentifier());

        if (userRepository.existsByUserIdentifierAndIsDeletedFalse(req.getUserIdentifier())) {
            throw new ValidationException("User identifier already exists");
        }

        List<Role> roles = roleRepository.findByNameInAndIsDeletedFalse(req.getRoles());
        if (roles.size() != req.getRoles().size()) throw new ValidationException("One or more roles not found");
        validateRoleUserTypeCompatibility(roles, req.getUserType());

        User user = userMapper.toEntity(req);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRoles(roles);
        User saved = userRepository.save(user);

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
        log.info("User created: {} type={}", saved.getUserIdentifier(), saved.getUserType());
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<UserResponse> getAllUsers(UserFilterRequest request) {
        Pageable pageable = PaginationUtils.createPageable(
                request.getPageNo(), request.getPageSize(), request.getSortBy(), request.getSortDirection());

        List<UserType> userTypes = nullIfEmpty(request.getUserTypes());
        List<AccountStatus> accountStatuses = nullIfEmpty(request.getAccountStatuses());
        List<String> roles = nullIfEmpty(request.getRoles());

        Page<User> page = userRepository.searchUsers(
                null, userTypes, accountStatuses, roles, request.getSearch(), pageable);
        return userMapper.toPaginationResponse(page, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getUserById(UUID userId) {
        return userMapper.toDetailResponse(userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    @Override
    public UserResponse updateUser(UUID userId, UserUpdateRequest req) {
        log.info("Updating user: {}", userId);
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getRoles() != null && !req.getRoles().isEmpty()) {
            List<Role> roles = roleRepository.findByNameInAndIsDeletedFalse(req.getRoles());
            if (roles.size() != req.getRoles().size()) throw new ValidationException("One or more roles not found");
            validateRoleUserTypeCompatibility(roles, user.getUserType());
            user.getRoles().clear();
            user.getRoles().addAll(roles);
        }

        userMapper.updateEntity(req, user);

        // Profile
        UserProfile profile = user.getProfile();
        if (profile == null) { profile = new UserProfile(); profile.setUser(user); user.setProfile(profile); }
        if (req.getEmail() != null) profile.setEmail(req.getEmail());
        if (req.getFirstName() != null) profile.setFirstName(req.getFirstName());
        if (req.getLastName() != null) profile.setLastName(req.getLastName());
        if (req.getNickname() != null) profile.setNickname(req.getNickname());
        if (req.getGender() != null) profile.setGender(req.getGender());
        if (req.getDateOfBirth() != null) profile.setDateOfBirth(req.getDateOfBirth());
        if (req.getPhoneNumber() != null) profile.setPhoneNumber(req.getPhoneNumber());
        if (req.getProfileImageUrl() != null) profile.setProfileImageUrl(req.getProfileImageUrl());

        User updated = userRepository.save(user);
        log.info("User updated: {}", updated.getUserIdentifier());
        return userMapper.toResponse(updated);
    }

    @Override
    public UserResponse deleteUser(UUID userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getId().equals(securityUtils.getCurrentUser().getId())) {
            throw new ValidationException("You cannot delete your own account");
        }
        user.softDelete();
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        return userMapper.toResponse(securityUtils.getCurrentUser());
    }

    /**
     * Updates the current authenticated user's profile.
     * Convenience method that extracts the current user ID and calls updateUser.
     */
    @Override
    @Transactional
    public UserResponse updateCurrentUser(UserUpdateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        return updateUser(currentUser.getId(), request);
    }


    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateRoleUserTypeCompatibility(List<Role> roles, UserType userType) {
        roles.forEach(r -> {
            if (!r.isCompatibleWithUserType(userType)) {
                throw new ValidationException(String.format(
                        "Role '%s' is not compatible with user type '%s'.", r.getName(), userType));
            }
        });
    }

    private <T> List<T> nullIfEmpty(List<T> list) {
        return (list != null && !list.isEmpty()) ? list : null;
    }
}
