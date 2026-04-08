package com.emenu.features.auth.dto.update;

import com.emenu.enums.common.Status;
import com.emenu.enums.user.*;
import com.emenu.features.auth.dto.request.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class UserUpdateRequest {

    // Account
    private AccountStatus accountStatus;
    private Status status;
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

    // Employment
    private String employeeId;
    private String position;
    private String department;
    private EmploymentType employmentType;
    private LocalDate joinDate;
    private LocalDate leaveDate;
    private String shift;
}
