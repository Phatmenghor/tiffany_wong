package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.request.BusinessHoursCreateRequest;
import com.emenu.features.auth.dto.request.SocialMediaCreateRequest;
import com.emenu.features.auth.dto.response.SystemSettingResponse;
import com.emenu.features.auth.dto.update.SystemSettingUpdateRequest;
import com.emenu.features.auth.service.SystemSettingService;
import com.emenu.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system-settings")
@RequiredArgsConstructor
@Slf4j
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    @GetMapping
    public ResponseEntity<ApiResponse<SystemSettingResponse>> getSystemSetting() {
        log.info("Get system setting");
        SystemSettingResponse response = systemSettingService.getSystemSetting();
        return ResponseEntity.ok(ApiResponse.success("System setting retrieved successfully", response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<SystemSettingResponse>> updateSystemSetting(
            @Valid @RequestBody SystemSettingUpdateRequest request) {
        log.info("Update system setting");
        SystemSettingResponse response = systemSettingService.updateSystemSetting(request);
        return ResponseEntity.ok(ApiResponse.success("System setting updated successfully", response));
    }

    @PutMapping("/social-media")
    public ResponseEntity<ApiResponse<SystemSettingResponse>> updateSocialMediaList(
            @Valid @RequestBody List<SocialMediaCreateRequest> socialMediaList) {
        log.info("Update social media list - {} items", socialMediaList.size());
        SystemSettingResponse response = systemSettingService.updateSocialMediaList(socialMediaList);
        return ResponseEntity.ok(ApiResponse.success("Social media updated successfully", response));
    }

    @PutMapping("/business-hours")
    public ResponseEntity<ApiResponse<SystemSettingResponse>> updateBusinessHoursList(
            @Valid @RequestBody List<BusinessHoursCreateRequest> businessHoursList) {
        log.info("Update business hours list - {} items", businessHoursList.size());
        SystemSettingResponse response = systemSettingService.updateBusinessHoursList(businessHoursList);
        return ResponseEntity.ok(ApiResponse.success("Business hours updated successfully", response));
    }
}
