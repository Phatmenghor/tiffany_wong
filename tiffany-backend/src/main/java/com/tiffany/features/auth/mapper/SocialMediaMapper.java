package com.tiffany.features.auth.mapper;

import com.tiffany.features.auth.dto.request.SocialMediaCreateRequest;
import com.tiffany.features.auth.dto.response.SocialMediaResponse;
import com.tiffany.features.auth.dto.update.SocialMediaUpdateRequest;
import com.tiffany.features.auth.models.SocialMedia;
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
