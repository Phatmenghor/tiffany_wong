package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.SystemSettingCreateRequest;
import com.emenu.features.auth.dto.response.SystemSettingResponse;
import com.emenu.features.auth.dto.update.SystemSettingUpdateRequest;
import com.emenu.features.auth.models.SystemSetting;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SystemSettingMapper {

    @Autowired
    private SocialMediaMapper socialMediaMapper;

    @Autowired
    private BusinessHoursMapper businessHoursMapper;

    public SystemSetting toEntity(SystemSettingCreateRequest request) {
        if (request == null) {
            return null;
        }

        SystemSetting entity = new SystemSetting();
        entity.setTaxPercentage(request.getTaxPercentage());
        entity.setSystemName(request.getSystemName());
        entity.setLogoSystemUrl(request.getLogoSystemUrl());
        entity.setPrimaryColor(request.getPrimaryColor());
        entity.setContactAddress(request.getContactAddress());
        entity.setContactPhone(request.getContactPhone());
        entity.setContactEmail(request.getContactEmail());

        return entity;
    }

    public void updateEntity(SystemSettingUpdateRequest request, SystemSetting entity) {
        if (request == null || entity == null) {
            return;
        }

        if (request.getTaxPercentage() != null) {
            entity.setTaxPercentage(request.getTaxPercentage());
        }
        if (request.getSystemName() != null) {
            entity.setSystemName(request.getSystemName());
        }
        if (request.getLogoSystemUrl() != null) {
            entity.setLogoSystemUrl(request.getLogoSystemUrl());
        }
        if (request.getPrimaryColor() != null) {
            entity.setPrimaryColor(request.getPrimaryColor());
        }
        if (request.getContactAddress() != null) {
            entity.setContactAddress(request.getContactAddress());
        }
        if (request.getContactPhone() != null) {
            entity.setContactPhone(request.getContactPhone());
        }
        if (request.getContactEmail() != null) {
            entity.setContactEmail(request.getContactEmail());
        }
    }

    public SystemSettingResponse toResponse(SystemSetting entity) {
        if (entity == null) {
            return null;
        }

        SystemSettingResponse response = new SystemSettingResponse();
        response.setId(entity.getId());
        response.setTaxPercentage(entity.getTaxPercentage());
        response.setSystemName(entity.getSystemName());
        response.setLogoSystemUrl(entity.getLogoSystemUrl());
        response.setPrimaryColor(entity.getPrimaryColor());
        response.setContactAddress(entity.getContactAddress());
        response.setContactPhone(entity.getContactPhone());
        response.setContactEmail(entity.getContactEmail());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setCreatedBy(entity.getCreatedBy());
        response.setUpdatedBy(entity.getUpdatedBy());

        if (entity.getSocialMedia() != null) {
            response.setSocialMedia(entity.getSocialMedia().stream()
                    .map(socialMediaMapper::toResponse)
                    .toList());
        }

        if (entity.getBusinessHours() != null) {
            response.setBusinessHours(entity.getBusinessHours().stream()
                    .map(businessHoursMapper::toResponse)
                    .toList());
        }

        return response;
    }
}
