package com.emenu.features.auth.service.impl;

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
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final com.emenu.shared.mapper.PaginationMapper paginationMapper;

    @Override
    public SystemSettingResponse createSystemSetting(SystemSettingCreateRequest request) {
        log.info("Creating system setting: {}", request.getSystemName());

        SystemSetting setting = systemSettingMapper.toEntity(request);
        SystemSetting saved = systemSettingRepository.save(setting);

        log.info("System setting created: {} with ID: {}", saved.getSystemName(), saved.getId());
        return systemSettingMapper.toResponse(saved);
    }

    @Override
    public SystemSettingResponse updateSystemSetting(UUID id, SystemSettingUpdateRequest request) {
        log.info("Updating system setting: {}", id);
        SystemSetting setting = systemSettingRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("System setting not found"));

        systemSettingMapper.updateEntity(request, setting);
        SystemSetting updated = systemSettingRepository.save(setting);

        log.info("System setting updated: {}", id);
        return systemSettingMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public SystemSettingResponse getSystemSetting(UUID id) {
        log.info("Getting system setting: {}", id);
        SystemSetting setting = systemSettingRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("System setting not found"));

        return systemSettingMapper.toResponse(setting);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<SystemSettingResponse> getAllSystemSettings(SystemSettingFilterRequest filter) {
        log.info("Getting all system settings - Page: {}, Size: {}", filter.getPageNo(), filter.getPageSize());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection());

        Page<SystemSetting> page = systemSettingRepository.findAll(pageable);
        Page<SystemSettingResponse> responsePage = page.map(systemSettingMapper::toResponse);
        return paginationMapper.toPaginationResponse(responsePage);
    }

    @Override
    public SystemSettingResponse deleteSystemSetting(UUID id) {
        log.info("Deleting system setting: {}", id);
        SystemSetting setting = systemSettingRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("System setting not found"));

        setting.softDelete();
        SystemSetting deleted = systemSettingRepository.save(setting);

        log.info("System setting deleted: {}", id);
        return systemSettingMapper.toResponse(deleted);
    }

    @Override
    public SocialMediaResponse addSocialMedia(UUID settingId, SocialMediaCreateRequest request) {
        log.info("Adding social media to system setting: {}", settingId);

        SystemSetting setting = systemSettingRepository.findByIdAndIsDeletedFalse(settingId)
                .orElseThrow(() -> new RuntimeException("System setting not found"));

        SocialMedia media = socialMediaMapper.toEntity(request);
        media.setSystemSettingId(settingId);
        SocialMedia saved = socialMediaRepository.save(media);

        log.info("Social media added: {} for setting: {}", saved.getId(), settingId);
        return socialMediaMapper.toResponse(saved);
    }

    @Override
    public SocialMediaResponse updateSocialMedia(UUID settingId, UUID socialMediaId, SocialMediaUpdateRequest request) {
        log.info("Updating social media: {} for setting: {}", socialMediaId, settingId);

        SocialMedia media = socialMediaRepository.findById(socialMediaId)
                .orElseThrow(() -> new RuntimeException("Social media not found"));

        if (!media.getSystemSettingId().equals(settingId)) {
            throw new RuntimeException("Social media does not belong to this setting");
        }

        socialMediaMapper.updateEntity(request, media);
        SocialMedia updated = socialMediaRepository.save(media);

        log.info("Social media updated: {}", socialMediaId);
        return socialMediaMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public SocialMediaResponse getSocialMedia(UUID settingId, UUID socialMediaId) {
        log.info("Getting social media: {} for setting: {}", socialMediaId, settingId);

        SocialMedia media = socialMediaRepository.findById(socialMediaId)
                .orElseThrow(() -> new RuntimeException("Social media not found"));

        if (!media.getSystemSettingId().equals(settingId)) {
            throw new RuntimeException("Social media does not belong to this setting");
        }

        return socialMediaMapper.toResponse(media);
    }

    @Override
    public void deleteSocialMedia(UUID settingId, UUID socialMediaId) {
        log.info("Deleting social media: {} for setting: {}", socialMediaId, settingId);

        SocialMedia media = socialMediaRepository.findById(socialMediaId)
                .orElseThrow(() -> new RuntimeException("Social media not found"));

        if (!media.getSystemSettingId().equals(settingId)) {
            throw new RuntimeException("Social media does not belong to this setting");
        }

        media.softDelete();
        socialMediaRepository.save(media);

        log.info("Social media deleted: {}", socialMediaId);
    }

    @Override
    public BusinessHoursResponse addBusinessHours(UUID settingId, BusinessHoursCreateRequest request) {
        log.info("Adding business hours to system setting: {}", settingId);

        SystemSetting setting = systemSettingRepository.findByIdAndIsDeletedFalse(settingId)
                .orElseThrow(() -> new RuntimeException("System setting not found"));

        BusinessHours hours = businessHoursMapper.toEntity(request);
        hours.setSystemSettingId(settingId);
        BusinessHours saved = businessHoursRepository.save(hours);

        log.info("Business hours added: {} for setting: {}", saved.getId(), settingId);
        return businessHoursMapper.toResponse(saved);
    }

    @Override
    public BusinessHoursResponse updateBusinessHours(UUID settingId, UUID businessHoursId, BusinessHoursUpdateRequest request) {
        log.info("Updating business hours: {} for setting: {}", businessHoursId, settingId);

        BusinessHours hours = businessHoursRepository.findByIdAndIsDeletedFalse(businessHoursId)
                .orElseThrow(() -> new RuntimeException("Business hours not found"));

        if (!hours.getSystemSettingId().equals(settingId)) {
            throw new RuntimeException("Business hours does not belong to this setting");
        }

        businessHoursMapper.updateEntity(request, hours);
        BusinessHours updated = businessHoursRepository.save(hours);

        log.info("Business hours updated: {}", businessHoursId);
        return businessHoursMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessHoursResponse getBusinessHours(UUID settingId, UUID businessHoursId) {
        log.info("Getting business hours: {} for setting: {}", businessHoursId, settingId);

        BusinessHours hours = businessHoursRepository.findByIdAndIsDeletedFalse(businessHoursId)
                .orElseThrow(() -> new RuntimeException("Business hours not found"));

        if (!hours.getSystemSettingId().equals(settingId)) {
            throw new RuntimeException("Business hours does not belong to this setting");
        }

        return businessHoursMapper.toResponse(hours);
    }

    @Override
    public void deleteBusinessHours(UUID settingId, UUID businessHoursId) {
        log.info("Deleting business hours: {} for setting: {}", businessHoursId, settingId);

        BusinessHours hours = businessHoursRepository.findByIdAndIsDeletedFalse(businessHoursId)
                .orElseThrow(() -> new RuntimeException("Business hours not found"));

        if (!hours.getSystemSettingId().equals(settingId)) {
            throw new RuntimeException("Business hours does not belong to this setting");
        }

        hours.softDelete();
        businessHoursRepository.save(hours);

        log.info("Business hours deleted: {}", businessHoursId);
    }
}
