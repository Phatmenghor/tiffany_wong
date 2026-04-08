package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.SystemSettingCreateRequest;
import com.emenu.features.auth.dto.response.SystemSettingResponse;
import com.emenu.features.auth.dto.update.SystemSettingUpdateRequest;
import com.emenu.features.auth.models.SystemSetting;
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
