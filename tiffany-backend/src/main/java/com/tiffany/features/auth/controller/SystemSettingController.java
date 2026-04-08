package com.tiffany.features.auth.controller;

import com.tiffany.features.auth.dto.response.SystemSettingResponse;
import com.tiffany.features.auth.dto.update.SystemSettingUpdateRequest;
import com.tiffany.features.auth.service.SystemSettingService;
import com.tiffany.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    /**
     * Single unified update endpoint for system settings.
     * Handles create/update/delete for all system configuration:
     * - System setting fields (tax, colors, contact info)
     * - Social media items (create if no ID, update if ID exists, delete if null)
     * - Business hours items (create if no ID, update if ID exists, delete if null)
     */
    @PutMapping
    public ResponseEntity<ApiResponse<SystemSettingResponse>> updateSystemSetting(
            @Valid @RequestBody SystemSettingUpdateRequest request) {
        log.info("Update system setting with nested collections");
        SystemSettingResponse response = systemSettingService.updateSystemSetting(request);
        return ResponseEntity.ok(ApiResponse.success("System setting updated successfully", response));
    }
}
