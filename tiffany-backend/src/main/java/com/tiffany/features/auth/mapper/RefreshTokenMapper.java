package com.tiffany.features.auth.mapper;

import com.tiffany.features.auth.dto.helper.RefreshTokenCreateHelper;
import com.tiffany.features.auth.models.RefreshToken;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct mapper for RefreshToken entity
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RefreshTokenMapper {

    /**
     * Create RefreshToken from helper DTO - pure MapStruct mapping
     */
    RefreshToken createFromHelper(RefreshTokenCreateHelper helper);
}
