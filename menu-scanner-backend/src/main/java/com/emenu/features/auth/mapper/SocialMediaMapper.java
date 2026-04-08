package com.emenu.features.auth.mapper;

import com.emenu.features.auth.dto.request.SocialMediaCreateRequest;
import com.emenu.features.auth.dto.response.SocialMediaResponse;
import com.emenu.features.auth.dto.update.SocialMediaUpdateRequest;
import com.emenu.features.auth.models.SocialMedia;
import org.springframework.stereotype.Component;

/**
 * Social Media Mapper
 * Maps between SocialMedia entity and SocialMediaResponse DTO
 */
@Component
public class SocialMediaMapper {

    public SocialMedia toEntity(SocialMediaCreateRequest request) {
        if (request == null) {
            return null;
        }

        SocialMedia entity = new SocialMedia();
        entity.setName(request.getName());
        entity.setLinkUrl(request.getLinkUrl());

        return entity;
    }

    public void updateEntity(SocialMediaUpdateRequest request, SocialMedia entity) {
        if (request == null || entity == null) {
            return;
        }

        if (request.getName() != null) {
            entity.setName(request.getName());
        }
        if (request.getLinkUrl() != null) {
            entity.setLinkUrl(request.getLinkUrl());
        }
    }

    public SocialMediaResponse toResponse(SocialMedia entity) {
        if (entity == null) {
            return null;
        }

        SocialMediaResponse response = new SocialMediaResponse();
        response.setId(entity.getId());
        response.setSystemSettingId(entity.getSystemSettingId());
        response.setName(entity.getName());
        response.setLinkUrl(entity.getLinkUrl());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setCreatedBy(entity.getCreatedBy());
        response.setUpdatedBy(entity.getUpdatedBy());

        return response;
    }
}
