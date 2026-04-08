package com.tiffany.features.auth.mapper;

import com.tiffany.features.auth.dto.request.BusinessHoursCreateRequest;
import com.tiffany.features.auth.dto.response.BusinessHoursResponse;
import com.tiffany.features.auth.dto.update.BusinessHoursUpdateRequest;
import com.tiffany.features.auth.models.BusinessHours;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface BusinessHoursMapper {

    BusinessHours toEntity(BusinessHoursCreateRequest request);

    void updateEntity(BusinessHoursUpdateRequest request, @MappingTarget BusinessHours entity);

    BusinessHoursResponse toResponse(BusinessHours entity);
}
