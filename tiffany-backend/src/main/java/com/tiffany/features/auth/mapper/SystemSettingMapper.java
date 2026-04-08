package com.tiffany.features.auth.mapper;

import com.tiffany.features.auth.dto.request.SystemSettingCreateRequest;
import com.tiffany.features.auth.dto.response.SystemSettingResponse;
import com.tiffany.features.auth.dto.update.SystemSettingUpdateRequest;
import com.tiffany.features.auth.models.SystemSetting;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
    uses = {SocialMediaMapper.class, BusinessHoursMapper.class}
)
public interface SystemSettingMapper {

    SystemSetting toEntity(SystemSettingCreateRequest request);

    void updateEntity(SystemSettingUpdateRequest request, @MappingTarget SystemSetting entity);

    SystemSettingResponse toResponse(SystemSetting entity);
}
