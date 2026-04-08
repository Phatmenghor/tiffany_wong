package com.tiffany.features.auth.mapper;

import com.tiffany.features.auth.dto.request.RegisterRequest;
import com.tiffany.features.auth.dto.request.UserCreateRequest;
import com.tiffany.features.auth.dto.response.*;
import com.tiffany.features.auth.dto.update.UserUpdateRequest;
import com.tiffany.features.auth.models.*;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.mapper.PaginationMapper;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PaginationMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "fullName",          expression = "java(user.getFullName())")
    // Personal from profile
    @Mapping(target = "email",             source = "profile.email")
    @Mapping(target = "firstName",         source = "profile.firstName")
    @Mapping(target = "lastName",          source = "profile.lastName")
    @Mapping(target = "nickname",          source = "profile.nickname")
    @Mapping(target = "gender",            source = "profile.gender")
    @Mapping(target = "dateOfBirth",       source = "profile.dateOfBirth")
    @Mapping(target = "phoneNumber",       source = "profile.phoneNumber")
    @Mapping(target = "profileImageUrl",   source = "profile.profileImageUrl")
    UserResponse toResponse(User user);

    @Mapping(target = "fullName",          expression = "java(user.getFullName())")
    // Personal from profile
    @Mapping(target = "email",             source = "profile.email")
    @Mapping(target = "firstName",         source = "profile.firstName")
    @Mapping(target = "lastName",          source = "profile.lastName")
    @Mapping(target = "nickname",          source = "profile.nickname")
    @Mapping(target = "gender",            source = "profile.gender")
    @Mapping(target = "dateOfBirth",       source = "profile.dateOfBirth")
    @Mapping(target = "phoneNumber",       source = "profile.phoneNumber")
    @Mapping(target = "profileImageUrl",   source = "profile.profileImageUrl")
    UserDetailResponse toDetailResponse(User user);

    @Mapping(target = "firstName",         source = "profile.firstName")
    @Mapping(target = "lastName",          source = "profile.lastName")
    @Mapping(target = "email",             source = "profile.email")
    @Mapping(target = "phoneNumber",       source = "profile.phoneNumber")
    @Mapping(target = "profileImageUrl",   source = "profile.profileImageUrl")
    UserResponse toUserBasicInfo(User user);

    @Mapping(target = "userId",            source = "user.id")
    @Mapping(target = "fullName",          expression = "java(user.getFullName())")
    @Mapping(target = "accessToken",       source = "token")
    @Mapping(target = "tokenType",         constant = "Bearer")
    @Mapping(target = "email",             source = "user.profile.email")
    @Mapping(target = "profileImageUrl",   source = "user.profile.profileImageUrl")
    LoginResponse toLoginResponse(User user, String token);

    List<UserResponse> toResponseList(List<User> users);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "roles",             ignore = true)
    @Mapping(target = "password",          ignore = true)
    @Mapping(target = "profile",           ignore = true)
    void updateEntity(UserUpdateRequest request, @MappingTarget User user);

    @Mapping(target = "roles",             ignore = true)
    @Mapping(target = "password",          ignore = true)
    @Mapping(target = "profile",           ignore = true)
    User toEntity(UserCreateRequest request);

    @Mapping(target = "roles",             ignore = true)
    @Mapping(target = "password",          ignore = true)
    @Mapping(target = "profile",           ignore = true)
    User toEntity(RegisterRequest request);

    default PaginationResponse<UserResponse> toPaginationResponse(Page<User> page, PaginationMapper paginationMapper) {
        return paginationMapper.toPaginationResponse(page, this::toResponseList);
    }
}
