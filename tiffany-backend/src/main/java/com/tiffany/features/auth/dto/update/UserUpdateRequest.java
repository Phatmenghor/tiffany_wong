package com.tiffany.features.auth.dto.update;

import com.tiffany.enums.common.Status;
import com.tiffany.enums.user.*;
import com.tiffany.features.auth.dto.request.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class UserUpdateRequest {

    // Account
    private AccountStatus accountStatus;
    private Status status;
    private UserRole userRole;
    private List<String> roles;
    private String remark;

    // Personal
    private String email;
    private String firstName;
    private String lastName;
    private String nickname;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String profileImageUrl;
}
