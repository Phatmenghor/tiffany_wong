package com.emenu.features.auth.service.impl;

import com.emenu.features.auth.dto.request.BusinessHoursCreateRequest;
import com.emenu.features.auth.dto.request.SocialMediaCreateRequest;
import com.emenu.features.auth.dto.response.SystemSettingResponse;
import com.emenu.features.auth.dto.update.BusinessHoursUpdateRequest;
import com.emenu.features.auth.dto.update.SocialMediaUpdateRequest;
import com.emenu.features.auth.dto.update.SystemSettingUpdateRequest;
import com.emenu.features.auth.mapper.BusinessHoursMapper;
import com.emenu.features.auth.mapper.SocialMediaMapper;
import com.emenu.features.auth.mapper.SystemSettingMapper;
import com.emenu.features.auth.models.BusinessHours;
import com.emenu.features.auth.models.SocialMedia;
import com.emenu.features.auth.models.SystemSetting;
import com.emenu.features.auth.repository.BusinessHoursRepository;
import com.emenu.features.auth.repository.SocialMediaRepository;
import com.emenu.features.auth.repository.SystemSettingRepository;
import com.emenu.features.auth.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SystemSettingServiceImpl implements SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;
    private final SocialMediaRepository socialMediaRepository;
    private final BusinessHoursRepository businessHoursRepository;
    private final SystemSettingMapper systemSettingMapper;
    private final SocialMediaMapper socialMediaMapper;
    private final BusinessHoursMapper businessHoursMapper;

    @Override
    @Transactional(readOnly = true)
    public SystemSettingResponse getSystemSetting() {
        log.info("Getting system setting (singleton)");

        SystemSetting setting = systemSettingRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("System setting not configured. Please initialize system settings."));

        return systemSettingMapper.toResponse(setting);
    }

    @Override
    public SystemSettingResponse updateSystemSetting(SystemSettingUpdateRequest request) {
        log.info("Updating system setting");

        SystemSetting setting = systemSettingRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("System setting not configured"));

        systemSettingMapper.updateEntity(request, setting);
        SystemSetting updated = systemSettingRepository.save(setting);

        log.info("System setting updated");
        return systemSettingMapper.toResponse(updated);
    }

    @Override
    public SystemSettingResponse updateSocialMediaList(List<SocialMediaCreateRequest> socialMediaList) {
        log.info("Updating social media list - {} items", socialMediaList.size());

        SystemSetting setting = systemSettingRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("System setting not configured"));

        // Get current social media items
        List<SocialMedia> currentItems = socialMediaRepository.findBySystemSettingIdAndIsDeletedFalse(setting.getId());

        // Upsert logic: process provided items
        for (SocialMediaCreateRequest request : socialMediaList) {
            if (request.getName() == null) {
                log.warn("Skipping social media item with null name");
                continue;
            }

            SocialMedia existingItem = currentItems.stream()
                    .filter(item -> item.getName().equals(request.getName()))
                    .findFirst()
                    .orElse(null);

            if (existingItem != null) {
                // Update existing
                SocialMediaUpdateRequest updateRequest = new SocialMediaUpdateRequest();
                updateRequest.setName(request.getName());
                updateRequest.setLinkUrl(request.getLinkUrl());
                socialMediaMapper.updateEntity(updateRequest, existingItem);
                socialMediaRepository.save(existingItem);
                log.info("Updated social media: {}", request.getName());
            } else {
                // Create new
                SocialMedia newItem = socialMediaMapper.toEntity(request);
                newItem.setSystemSettingId(setting.getId());
                socialMediaRepository.save(newItem);
                log.info("Created social media: {}", request.getName());
            }
        }

        // Remove items not in the new list
        currentItems.forEach(currentItem -> {
            boolean shouldKeep = socialMediaList.stream()
                    .anyMatch(req -> req.getName().equals(currentItem.getName()));

            if (!shouldKeep) {
                currentItem.softDelete();
                socialMediaRepository.save(currentItem);
                log.info("Removed social media: {}", currentItem.getName());
            }
        });

        SystemSetting updated = systemSettingRepository.save(setting);
        return systemSettingMapper.toResponse(updated);
    }

    @Override
    public SystemSettingResponse updateBusinessHoursList(List<BusinessHoursCreateRequest> businessHoursList) {
        log.info("Updating business hours list - {} items", businessHoursList.size());

        SystemSetting setting = systemSettingRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("System setting not configured"));

        // Get current business hours items
        List<BusinessHours> currentItems = businessHoursRepository.findBySystemSettingIdAndIsDeletedFalse(setting.getId());

        // Upsert logic: process provided items
        for (BusinessHoursCreateRequest request : businessHoursList) {
            if (request.getDay() == null) {
                log.warn("Skipping business hours item with null day");
                continue;
            }

            BusinessHours existingItem = currentItems.stream()
                    .filter(item -> item.getDay().equals(request.getDay()))
                    .findFirst()
                    .orElse(null);

            if (existingItem != null) {
                // Update existing
                BusinessHoursUpdateRequest updateRequest = new BusinessHoursUpdateRequest();
                updateRequest.setDay(request.getDay());
                updateRequest.setOpeningTime(request.getOpeningTime());
                updateRequest.setClosingTime(request.getClosingTime());
                businessHoursMapper.updateEntity(updateRequest, existingItem);
                businessHoursRepository.save(existingItem);
                log.info("Updated business hours: {}", request.getDay());
            } else {
                // Create new
                BusinessHours newItem = businessHoursMapper.toEntity(request);
                newItem.setSystemSettingId(setting.getId());
                businessHoursRepository.save(newItem);
                log.info("Created business hours: {}", request.getDay());
            }
        }

        // Remove items not in the new list
        currentItems.forEach(currentItem -> {
            boolean shouldKeep = businessHoursList.stream()
                    .anyMatch(req -> req.getDay().equals(currentItem.getDay()));

            if (!shouldKeep) {
                currentItem.softDelete();
                businessHoursRepository.save(currentItem);
                log.info("Removed business hours: {}", currentItem.getDay());
            }
        });

        SystemSetting updated = systemSettingRepository.save(setting);
        return systemSettingMapper.toResponse(updated);
    }
}
