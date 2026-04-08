package com.emenu.features.auth.service;

import com.emenu.features.auth.dto.request.BusinessHoursCreateRequest;
import com.emenu.features.auth.dto.request.SocialMediaCreateRequest;
import com.emenu.features.auth.dto.response.SystemSettingResponse;
import com.emenu.features.auth.dto.update.BusinessHoursUpdateRequest;
import com.emenu.features.auth.dto.update.SocialMediaUpdateRequest;
import com.emenu.features.auth.dto.update.SystemSettingUpdateRequest;

import java.util.List;

public interface SystemSettingService {
    // System Setting Operations (Singleton - only one record)
    SystemSettingResponse getSystemSetting();
    SystemSettingResponse updateSystemSetting(SystemSettingUpdateRequest request);

    // Social Media Operations (Upsert - create if no ID, update if exists, remove if not in list)
    SystemSettingResponse updateSocialMediaList(List<SocialMediaCreateRequest> socialMediaList);

    // Business Hours Operations (Upsert - create if no ID, update if exists, remove if not in list)
    SystemSettingResponse updateBusinessHoursList(List<BusinessHoursCreateRequest> businessHoursList);
}
