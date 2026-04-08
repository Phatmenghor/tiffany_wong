package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.BusinessHoursCreateRequest;
import com.emenu.features.auth.dto.response.BusinessHoursResponse;
import com.emenu.features.auth.dto.update.BusinessHoursUpdateRequest;
import com.emenu.features.auth.models.BusinessHours;
import org.springframework.stereotype.Component;

@Component
public class BusinessHoursMapper {

    public BusinessHours toEntity(BusinessHoursCreateRequest request) {
        if (request == null) {
            return null;
        }

        BusinessHours entity = new BusinessHours();
        entity.setDay(request.getDay());
        entity.setOpeningTime(request.getOpeningTime());
        entity.setClosingTime(request.getClosingTime());

        return entity;
    }

    public void updateEntity(BusinessHoursUpdateRequest request, BusinessHours entity) {
        if (request == null || entity == null) {
            return;
        }

        if (request.getDay() != null) {
            entity.setDay(request.getDay());
        }
        if (request.getOpeningTime() != null) {
            entity.setOpeningTime(request.getOpeningTime());
        }
        if (request.getClosingTime() != null) {
            entity.setClosingTime(request.getClosingTime());
        }
    }

    public BusinessHoursResponse toResponse(BusinessHours entity) {
        if (entity == null) {
            return null;
        }

        BusinessHoursResponse response = new BusinessHoursResponse();
        response.setId(entity.getId());
        response.setSystemSettingId(entity.getSystemSettingId());
        response.setDay(entity.getDay());
        response.setOpeningTime(entity.getOpeningTime());
        response.setClosingTime(entity.getClosingTime());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setCreatedBy(entity.getCreatedBy());
        response.setUpdatedBy(entity.getUpdatedBy());

        return response;
    }
}
