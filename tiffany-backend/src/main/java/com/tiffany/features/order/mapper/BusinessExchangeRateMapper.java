package com.tiffany.features.order.mapper;

import com.tiffany.features.order.dto.request.BusinessExchangeRateCreateRequest;
import com.tiffany.features.order.dto.response.BusinessExchangeRateResponse;
import com.tiffany.features.order.dto.update.BusinessExchangeRateUpdateRequest;
import com.tiffany.features.order.models.BusinessExchangeRate;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.mapper.PaginationMapper;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PaginationMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BusinessExchangeRateMapper {

    @Mapping(target = "status", constant = "ACTIVE")
    BusinessExchangeRate toEntity(BusinessExchangeRateCreateRequest request);

    BusinessExchangeRateResponse toResponse(BusinessExchangeRate exchangeRate);

    List<BusinessExchangeRateResponse> toResponseList(List<BusinessExchangeRate> exchangeRates);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(BusinessExchangeRateUpdateRequest request, @MappingTarget BusinessExchangeRate exchangeRate);

    default PaginationResponse<BusinessExchangeRateResponse> toPaginationResponse(Page<BusinessExchangeRate> exchangeRatePage, PaginationMapper paginationMapper) {
return paginationMapper.toPaginationResponse(exchangeRatePage, this::toResponseList);
    }
}