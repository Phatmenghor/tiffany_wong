package com.tiffany.features.auth.service.impl;

import com.tiffany.features.auth.dto.response.SystemSettingResponse;
import com.tiffany.features.auth.dto.update.SystemSettingUpdateRequest;
import com.tiffany.features.auth.mapper.SystemSettingMapper;
import com.tiffany.features.auth.models.SystemSetting;
import com.tiffany.features.auth.repository.SystemSettingRepository;
import com.tiffany.features.auth.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SystemSettingServiceImpl implements SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;
    private final SystemSettingMapper systemSettingMapper;

    @Override
    @Transactional(readOnly = true)
    public SystemSettingResponse getSystemSetting() {
        log.info("Fetching system setting");
        SystemSetting setting = systemSettingRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("System setting not configured"));
        log.info("System setting fetched: id={}", setting.getId());
        return systemSettingMapper.toResponse(setting);
    }

    @Override
    public SystemSettingResponse updateSystemSetting(SystemSettingUpdateRequest request) {
        SystemSetting setting = systemSettingRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("System setting not configured"));

        systemSettingMapper.updateEntity(request, setting);
        SystemSetting updated = systemSettingRepository.save(setting);
        log.info("System setting updated: id={}", updated.getId());
        return systemSettingMapper.toResponse(updated);
    }
}
