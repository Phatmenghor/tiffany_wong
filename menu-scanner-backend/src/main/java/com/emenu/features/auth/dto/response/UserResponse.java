package com.emenu.features.auth.dto.response;

import com.emenu.enums.common.Status;
import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.Gender;
import com.emenu.enums.user.UserType;
import com.emenu.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class UserResponse extends BaseAuditResponse {

    // ── Account ────────────────────────────────────────────────────────────
    private String userIdentifier;
    private UserType userType;
    private AccountStatus accountStatus;
    private Status status;
    private List<String> roles;
    private String remark;

    // ── Personal (from user_profiles) ─────────────────────────────────────
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String nickname;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String profileImageUrl;

    // ── Session ────────────────────────────────────────────────────────────
    private LocalDateTime lastLoginAt;
}
