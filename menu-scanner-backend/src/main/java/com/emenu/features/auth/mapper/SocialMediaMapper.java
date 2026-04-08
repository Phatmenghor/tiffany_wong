package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.SocialMediaCreateRequest;
import com.emenu.features.auth.dto.response.SocialMediaResponse;
import com.emenu.features.auth.dto.update.SocialMediaUpdateRequest;
import com.emenu.features.auth.models.SocialMedia;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

/**
 * Social Media Mapper
 * Maps between SocialMedia entity and SocialMediaResponse DTO
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface SocialMediaMapper {

    SocialMedia toEntity(SocialMediaCreateRequest request);

    void updateEntity(SocialMediaUpdateRequest request, @MappingTarget SocialMedia entity);

    SocialMediaResponse toResponse(SocialMedia entity);
}
