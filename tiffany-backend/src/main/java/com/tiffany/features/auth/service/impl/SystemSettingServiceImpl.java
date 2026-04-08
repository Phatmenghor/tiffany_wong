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
        log.info("System setting retrieved");

        SystemSetting setting = systemSettingRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("System setting not configured. Please initialize system settings."));

        return systemSettingMapper.toResponse(setting);
    }

    @Override
    public SystemSettingResponse updateSystemSetting(SystemSettingUpdateRequest request) {
        log.info("System setting updated");

        SystemSetting setting = systemSettingRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("System setting not configured"));

        systemSettingMapper.updateEntity(request, setting);

        if (request.getSocialMediaList() != null && !request.getSocialMediaList().isEmpty()) {
            updateSocialMediaCollections(setting, request.getSocialMediaList());
        }

        if (request.getBusinessHoursList() != null && !request.getBusinessHoursList().isEmpty()) {
            updateBusinessHoursCollections(setting, request.getBusinessHoursList());
        }

        SystemSetting updated = systemSettingRepository.save(setting);
        log.info("System setting saved: company={}", updated.getCompanyName());
        return systemSettingMapper.toResponse(updated);
    }

    private void updateSocialMediaCollections(SystemSetting setting, List<SocialMediaCreateRequest> socialMediaList) {
        log.info("Social media update: count={}", socialMediaList.size());

        List<SocialMedia> currentItems = socialMediaRepository.findBySystemSettingIdAndIsDeletedFalse(setting.getId());

        for (SocialMediaCreateRequest request : socialMediaList) {
            if (request.getName() == null) continue;

            SocialMedia existingItem = currentItems.stream()
                    .filter(item -> item.getName().equals(request.getName()))
                    .findFirst()
                    .orElse(null);

            if (existingItem != null) {
                SocialMediaUpdateRequest updateRequest = new SocialMediaUpdateRequest();
                updateRequest.setName(request.getName());
                updateRequest.setLinkUrl(request.getLinkUrl());
                socialMediaMapper.updateEntity(updateRequest, existingItem);
                socialMediaRepository.save(existingItem);
            } else {
                SocialMedia newItem = socialMediaMapper.toEntity(request);
                newItem.setSystemSettingId(setting.getId());
                socialMediaRepository.save(newItem);
            }
        }

        for (SocialMedia currentItem : currentItems) {
            boolean shouldKeep = socialMediaList.stream()
                    .anyMatch(req -> req.getName().equals(currentItem.getName()));

            if (!shouldKeep) {
                currentItem.softDelete();
                socialMediaRepository.save(currentItem);
            }
        }
    }

    private void updateBusinessHoursCollections(SystemSetting setting, List<BusinessHoursCreateRequest> businessHoursList) {
        log.info("Business hours update: count={}", businessHoursList.size());

        List<BusinessHours> currentItems = businessHoursRepository.findBySystemSettingIdAndIsDeletedFalse(setting.getId());

        for (BusinessHoursCreateRequest request : businessHoursList) {
            if (request.getDay() == null) continue;

            BusinessHours existingItem = currentItems.stream()
                    .filter(item -> item.getDay().equals(request.getDay()))
                    .findFirst()
                    .orElse(null);

            if (existingItem != null) {
                BusinessHoursUpdateRequest updateRequest = new BusinessHoursUpdateRequest();
                updateRequest.setDay(request.getDay());
                updateRequest.setOpeningTime(request.getOpeningTime());
                updateRequest.setClosingTime(request.getClosingTime());
                businessHoursMapper.updateEntity(updateRequest, existingItem);
                businessHoursRepository.save(existingItem);
            } else {
                BusinessHours newItem = businessHoursMapper.toEntity(request);
                newItem.setSystemSettingId(setting.getId());
                businessHoursRepository.save(newItem);
            }
        }

        for (BusinessHours currentItem : currentItems) {
            boolean shouldKeep = businessHoursList.stream()
                    .anyMatch(req -> req.getDay().equals(currentItem.getDay()));

            if (!shouldKeep) {
                currentItem.softDelete();
                businessHoursRepository.save(currentItem);
            }
        }
    }

    @Override
    public SystemSettingResponse updateSocialMediaList(List<SocialMediaCreateRequest> socialMediaList) {
        log.info("Social media list updated: count={}", socialMediaList.size());

        SystemSetting setting = systemSettingRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("System setting not configured"));

        updateSocialMediaCollections(setting, socialMediaList);
        SystemSetting updated = systemSettingRepository.save(setting);
        return systemSettingMapper.toResponse(updated);
    }

    @Override
    public SystemSettingResponse updateBusinessHoursList(List<BusinessHoursCreateRequest> businessHoursList) {
        log.info("Business hours list updated: count={}", businessHoursList.size());

        SystemSetting setting = systemSettingRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("System setting not configured"));

        updateBusinessHoursCollections(setting, businessHoursList);
        SystemSetting updated = systemSettingRepository.save(setting);
        return systemSettingMapper.toResponse(updated);
    }
}
