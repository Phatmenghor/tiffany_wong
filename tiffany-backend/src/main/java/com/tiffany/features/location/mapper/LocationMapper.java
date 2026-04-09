package com.tiffany.features.location.mapper;

import com.tiffany.features.location.dto.request.LocationCreateRequest;
import com.tiffany.features.location.dto.response.LocationImageResponse;
import com.tiffany.features.location.dto.response.LocationResponse;
import com.tiffany.features.location.dto.update.LocationUpdateRequest;
import com.tiffany.features.location.models.Location;
import com.tiffany.features.location.models.LocationImage;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.mapper.PaginationMapper;
import org.mapstruct.*;
import org.springframework.data.domain.Page;


import java.util.List;

@Mapper(componentModel = "spring", uses = {PaginationMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LocationMapper {

    Location toEntity(LocationCreateRequest request);

    @Mapping(target = "fullAddress", expression = "java(address.getFullAddress())")
    @Mapping(target = "hasCoordinates", expression = "java(address.hasCoordinates())")
    @Mapping(target = "locationImages", source = "locationImages")
    LocationResponse toResponse(Location address);

    LocationImageResponse toImageResponse(LocationImage image);

    List<LocationImageResponse> toImageResponseList(List<LocationImage> images);

    List<LocationResponse> toResponseList(List<Location> addresses);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(LocationUpdateRequest request, @MappingTarget Location address);

    default PaginationResponse<LocationResponse> toPaginationResponse(Page<Location> addresses, PaginationMapper paginationMapper) {
return paginationMapper.toPaginationResponse(addresses, this::toResponseList);
    }
}