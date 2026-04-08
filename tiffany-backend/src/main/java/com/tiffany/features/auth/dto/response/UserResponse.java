package com.tiffany.features.auth.dto.response;

import com.tiffany.enums.common.Status;
import com.tiffany.enums.user.AccountStatus;
import com.tiffany.enums.user.Gender;
import com.tiffany.enums.user.UserRole;
import com.tiffany.enums.user.UserType;
import com.tiffany.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class UserResponse extends BaseAuditResponse {

    // ── Account ────────────────────────────────────────────────────────────
    private String userIdentifier;
    private UserType userType;
    private UserRole userRole;
    private AccountStatus accountStatus;
    private Status status;
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
}
