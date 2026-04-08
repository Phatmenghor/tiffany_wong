package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.filter.SystemSettingFilterRequest;
import com.emenu.features.auth.dto.request.BusinessHoursCreateRequest;
import com.emenu.features.auth.dto.request.SocialMediaCreateRequest;
import com.emenu.features.auth.dto.request.SystemSettingCreateRequest;
import com.emenu.features.auth.dto.response.BusinessHoursResponse;
import com.emenu.features.auth.dto.response.SocialMediaResponse;
import com.emenu.features.auth.dto.response.SystemSettingResponse;
import com.emenu.features.auth.dto.update.BusinessHoursUpdateRequest;
import com.emenu.features.auth.dto.update.SocialMediaUpdateRequest;
import com.emenu.features.auth.dto.update.SystemSettingUpdateRequest;
import com.emenu.features.auth.service.SystemSettingService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/system-settings")
@RequiredArgsConstructor
@Slf4j
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    // System Setting Operations
    @PostMapping
    public ResponseEntity<ApiResponse<SystemSettingResponse>> createSystemSetting(
            @Valid @RequestBody SystemSettingCreateRequest request) {
        log.info("Create system setting: {}", request.getSystemName());
        SystemSettingResponse response = systemSettingService.createSystemSetting(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("System setting created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SystemSettingResponse>> updateSystemSetting(
            @PathVariable UUID id,
            @Valid @RequestBody SystemSettingUpdateRequest request) {
        log.info("Update system setting: {}", id);
        SystemSettingResponse response = systemSettingService.updateSystemSetting(id, request);
        return ResponseEntity.ok(ApiResponse.success("System setting updated successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SystemSettingResponse>> getSystemSetting(@PathVariable UUID id) {
        log.info("Get system setting: {}", id);
        SystemSettingResponse response = systemSettingService.getSystemSetting(id);
        return ResponseEntity.ok(ApiResponse.success("System setting retrieved successfully", response));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<SystemSettingResponse>>> getAllSystemSettings(
            @Valid @RequestBody SystemSettingFilterRequest filter) {
        log.info("Get all system settings");
        PaginationResponse<SystemSettingResponse> response = systemSettingService.getAllSystemSettings(filter);
        return ResponseEntity.ok(ApiResponse.success("System settings retrieved successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<SystemSettingResponse>> deleteSystemSetting(@PathVariable UUID id) {
        log.info("Delete system setting: {}", id);
        SystemSettingResponse response = systemSettingService.deleteSystemSetting(id);
        return ResponseEntity.ok(ApiResponse.success("System setting deleted successfully", response));
    }

    // Social Media Operations
    @PostMapping("/{settingId}/social-media")
    public ResponseEntity<ApiResponse<SocialMediaResponse>> addSocialMedia(
            @PathVariable UUID settingId,
            @Valid @RequestBody SocialMediaCreateRequest request) {
        log.info("Add social media to setting: {}", settingId);
        SocialMediaResponse response = systemSettingService.addSocialMedia(settingId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Social media added successfully", response));
    }

    @PutMapping("/{settingId}/social-media/{socialMediaId}")
    public ResponseEntity<ApiResponse<SocialMediaResponse>> updateSocialMedia(
            @PathVariable UUID settingId,
            @PathVariable UUID socialMediaId,
            @Valid @RequestBody SocialMediaUpdateRequest request) {
        log.info("Update social media: {} for setting: {}", socialMediaId, settingId);
        SocialMediaResponse response = systemSettingService.updateSocialMedia(settingId, socialMediaId, request);
        return ResponseEntity.ok(ApiResponse.success("Social media updated successfully", response));
    }

    @GetMapping("/{settingId}/social-media/{socialMediaId}")
    public ResponseEntity<ApiResponse<SocialMediaResponse>> getSocialMedia(
            @PathVariable UUID settingId,
            @PathVariable UUID socialMediaId) {
        log.info("Get social media: {} for setting: {}", socialMediaId, settingId);
        SocialMediaResponse response = systemSettingService.getSocialMedia(settingId, socialMediaId);
        return ResponseEntity.ok(ApiResponse.success("Social media retrieved successfully", response));
    }

    @DeleteMapping("/{settingId}/social-media/{socialMediaId}")
    public ResponseEntity<ApiResponse<Void>> deleteSocialMedia(
            @PathVariable UUID settingId,
            @PathVariable UUID socialMediaId) {
        log.info("Delete social media: {} for setting: {}", socialMediaId, settingId);
        systemSettingService.deleteSocialMedia(settingId, socialMediaId);
        return ResponseEntity.ok(ApiResponse.success("Social media deleted successfully", null));
    }

    // Business Hours Operations
    @PostMapping("/{settingId}/business-hours")
    public ResponseEntity<ApiResponse<BusinessHoursResponse>> addBusinessHours(
            @PathVariable UUID settingId,
            @Valid @RequestBody BusinessHoursCreateRequest request) {
        log.info("Add business hours to setting: {}", settingId);
        BusinessHoursResponse response = systemSettingService.addBusinessHours(settingId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business hours added successfully", response));
    }

    @PutMapping("/{settingId}/business-hours/{businessHoursId}")
    public ResponseEntity<ApiResponse<BusinessHoursResponse>> updateBusinessHours(
            @PathVariable UUID settingId,
            @PathVariable UUID businessHoursId,
            @Valid @RequestBody BusinessHoursUpdateRequest request) {
        log.info("Update business hours: {} for setting: {}", businessHoursId, settingId);
        BusinessHoursResponse response = systemSettingService.updateBusinessHours(settingId, businessHoursId, request);
        return ResponseEntity.ok(ApiResponse.success("Business hours updated successfully", response));
    }

    @GetMapping("/{settingId}/business-hours/{businessHoursId}")
    public ResponseEntity<ApiResponse<BusinessHoursResponse>> getBusinessHours(
            @PathVariable UUID settingId,
            @PathVariable UUID businessHoursId) {
        log.info("Get business hours: {} for setting: {}", businessHoursId, settingId);
        BusinessHoursResponse response = systemSettingService.getBusinessHours(settingId, businessHoursId);
        return ResponseEntity.ok(ApiResponse.success("Business hours retrieved successfully", response));
    }

    @DeleteMapping("/{settingId}/business-hours/{businessHoursId}")
    public ResponseEntity<ApiResponse<Void>> deleteBusinessHours(
            @PathVariable UUID settingId,
            @PathVariable UUID businessHoursId) {
        log.info("Delete business hours: {} for setting: {}", businessHoursId, settingId);
        systemSettingService.deleteBusinessHours(settingId, businessHoursId);
        return ResponseEntity.ok(ApiResponse.success("Business hours deleted successfully", null));
    }
}
