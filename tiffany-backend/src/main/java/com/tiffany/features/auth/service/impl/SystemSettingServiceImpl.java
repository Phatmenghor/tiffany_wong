package com.tiffany.features.auth.service.impl;

import com.tiffany.features.auth.dto.request.BusinessHoursCreateRequest;
import com.tiffany.features.auth.dto.request.SocialMediaCreateRequest;
import com.tiffany.features.auth.dto.response.SystemSettingResponse;
import com.tiffany.features.auth.dto.update.BusinessHoursUpdateRequest;
import com.tiffany.features.auth.dto.update.SocialMediaUpdateRequest;
import com.tiffany.features.auth.dto.update.SystemSettingUpdateRequest;
import com.tiffany.features.auth.mapper.BusinessHoursMapper;
import com.tiffany.features.auth.mapper.SocialMediaMapper;
import com.tiffany.features.auth.mapper.SystemSettingMapper;
import com.tiffany.features.auth.models.BusinessHours;
import com.tiffany.features.auth.models.SocialMedia;
import com.tiffany.features.auth.models.SystemSetting;
import com.tiffany.features.auth.repository.BusinessHoursRepository;
import com.tiffany.features.auth.repository.SocialMediaRepository;
import com.tiffany.features.auth.repository.SystemSettingRepository;
import com.tiffany.features.auth.service.SystemSettingService;
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
        log.debug("Entering getSystemSetting");
        log.info("Fetching system setting (singleton)");

        SystemSetting setting = systemSettingRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> {
                    log.error("System setting retrieval failed: No system setting configured");
                    return new RuntimeException("System setting not configured. Please initialize system settings.");
                });

        log.debug("System setting retrieved: id={}, companyName={}, createdAt={}",
                setting.getId(), setting.getCompanyName(), setting.getCreatedAt());

        return systemSettingMapper.toResponse(setting);
    }

    @Override
    public SystemSettingResponse updateSystemSetting(SystemSettingUpdateRequest request) {
        log.debug("Entering updateSystemSetting");
        log.info("System setting update initiated");

        SystemSetting setting = systemSettingRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> {
                    log.error("System setting update failed: No system setting configured");
                    return new RuntimeException("System setting not configured");
                });

        log.debug("System setting found: id={}, companyName={}",
                setting.getId(), setting.getCompanyName());

        // Update system setting fields
        systemSettingMapper.updateEntity(request, setting);
        log.debug("System setting main fields updated: id={}", setting.getId());

        // Update social media list if provided
        if (request.getSocialMediaList() != null && !request.getSocialMediaList().isEmpty()) {
            log.debug("Processing social media updates: itemCount={}", request.getSocialMediaList().size());
            updateSocialMediaCollections(setting, request.getSocialMediaList());
        }

        // Update business hours list if provided
        if (request.getBusinessHoursList() != null && !request.getBusinessHoursList().isEmpty()) {
            log.debug("Processing business hours updates: itemCount={}", request.getBusinessHoursList().size());
            updateBusinessHoursCollections(setting, request.getBusinessHoursList());
        }

        SystemSetting updated = systemSettingRepository.save(setting);

        log.debug("System setting persisted: id={}, companyName={}",
                updated.getId(), updated.getCompanyName());

        log.info("System setting updated successfully: id={}, companyName={}",
                updated.getId(), updated.getCompanyName());
        return systemSettingMapper.toResponse(updated);
    }

    /**
     * Smart upsert logic for social media: create if no ID, update if exists, delete if not in list
     */
    private void updateSocialMediaCollections(SystemSetting setting, List<SocialMediaCreateRequest> socialMediaList) {
        log.debug("Entering updateSocialMediaCollections: settingId={}, itemCount={}",
                setting.getId(), socialMediaList.size());
        log.info("Updating social media list: settingId={}, itemCount={}", setting.getId(), socialMediaList.size());

        // Get current social media items
        List<SocialMedia> currentItems = socialMediaRepository.findBySystemSettingIdAndIsDeletedFalse(setting.getId());
        log.debug("Current social media items retrieved: count={}", currentItems.size());

        int createdCount = 0;
        int updatedCount = 0;

        // Upsert logic: process provided items
        for (SocialMediaCreateRequest request : socialMediaList) {
            if (request.getName() == null) {
                log.warn("Social media item skipped: null name");
                continue;
            }

            SocialMedia existingItem = currentItems.stream()
                    .filter(item -> item.getName().equals(request.getName()))
                    .findFirst()
                    .orElse(null);

            if (existingItem != null) {
                // Update existing
                log.debug("Social media item found for update: name={}, id={}", request.getName(), existingItem.getId());
                SocialMediaUpdateRequest updateRequest = new SocialMediaUpdateRequest();
                updateRequest.setName(request.getName());
                updateRequest.setLinkUrl(request.getLinkUrl());
                socialMediaMapper.updateEntity(updateRequest, existingItem);
                socialMediaRepository.save(existingItem);
                updatedCount++;
                log.debug("Social media item updated: name={}, linkUrl={}", request.getName(), request.getLinkUrl());
            } else {
                // Create new
                SocialMedia newItem = socialMediaMapper.toEntity(request);
                newItem.setSystemSettingId(setting.getId());
                socialMediaRepository.save(newItem);
                createdCount++;
                log.debug("Social media item created: name={}, linkUrl={}", request.getName(), request.getLinkUrl());
            }
        }

        // Remove items not in the new list
        int removedCount = 0;
        for (SocialMedia currentItem : currentItems) {
            boolean shouldKeep = socialMediaList.stream()
                    .anyMatch(req -> req.getName().equals(currentItem.getName()));

            if (!shouldKeep) {
                log.debug("Social media item removed: name={}, id={}", currentItem.getName(), currentItem.getId());
                currentItem.softDelete();
                socialMediaRepository.save(currentItem);
                removedCount++;
            }
        }

        log.info("Social media collection updated: settingId={}, created={}, updated={}, removed={}",
                setting.getId(), createdCount, updatedCount, removedCount);
    }

    /**
     * Smart upsert logic for business hours: create if no ID, update if exists, delete if not in list
     */
    private void updateBusinessHoursCollections(SystemSetting setting, List<BusinessHoursCreateRequest> businessHoursList) {
        log.info("Updating business hours list - {} items", businessHoursList.size());

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
