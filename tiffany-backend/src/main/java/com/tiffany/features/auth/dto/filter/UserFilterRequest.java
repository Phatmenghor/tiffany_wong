package com.tiffany.features.auth.dto.filter;

import com.tiffany.enums.user.AccountStatus;
import com.tiffany.enums.user.UserRole;
import com.tiffany.enums.user.UserType;
import com.tiffany.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class UserFilterRequest extends BaseFilterRequest {
    private List<AccountStatus> accountStatuses;
    private List<UserType> userTypes;
    private List<UserRole> userRoles;
}