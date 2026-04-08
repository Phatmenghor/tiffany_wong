package com.emenu.features.auth.service;

import com.emenu.features.auth.dto.request.BusinessHoursCreateRequest;
import com.emenu.features.auth.dto.request.SocialMediaCreateRequest;
import com.emenu.features.auth.dto.request.SystemSettingCreateRequest;
import com.emenu.features.auth.dto.response.BusinessHoursResponse;
import com.emenu.features.auth.dto.response.SocialMediaResponse;
import com.emenu.features.auth.dto.response.SystemSettingResponse;
import com.emenu.features.auth.dto.update.BusinessHoursUpdateRequest;
import com.emenu.features.auth.dto.update.SocialMediaUpdateRequest;
import com.emenu.features.auth.dto.update.SystemSettingUpdateRequest;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.features.auth.dto.filter.SystemSettingFilterRequest;

import java.util.UUID;

public interface SystemSettingService {
    // System Setting Operations
    SystemSettingResponse createSystemSetting(SystemSettingCreateRequest request);
    SystemSettingResponse updateSystemSetting(UUID id, SystemSettingUpdateRequest request);
    SystemSettingResponse getSystemSetting(UUID id);
    PaginationResponse<SystemSettingResponse> getAllSystemSettings(SystemSettingFilterRequest filter);
    SystemSettingResponse deleteSystemSetting(UUID id);

    // Social Media Operations
    SocialMediaResponse addSocialMedia(UUID settingId, SocialMediaCreateRequest request);
    SocialMediaResponse updateSocialMedia(UUID settingId, UUID socialMediaId, SocialMediaUpdateRequest request);
    SocialMediaResponse getSocialMedia(UUID settingId, UUID socialMediaId);
    void deleteSocialMedia(UUID settingId, UUID socialMediaId);

    // Business Hours Operations
    BusinessHoursResponse addBusinessHours(UUID settingId, BusinessHoursCreateRequest request);
    BusinessHoursResponse updateBusinessHours(UUID settingId, UUID businessHoursId, BusinessHoursUpdateRequest request);
    BusinessHoursResponse getBusinessHours(UUID settingId, UUID businessHoursId);
    void deleteBusinessHours(UUID settingId, UUID businessHoursId);
}
