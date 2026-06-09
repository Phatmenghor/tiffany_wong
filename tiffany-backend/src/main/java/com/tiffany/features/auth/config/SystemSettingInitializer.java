package com.tiffany.features.auth.config;

import com.tiffany.features.auth.models.SystemSetting;
import com.tiffany.features.auth.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class SystemSettingInitializer {

    private final SystemSettingRepository systemSettingRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeSystemSetting() {
        if (systemSettingRepository.findAll().isEmpty()) {
            log.info("Creating default system settings for Tiffany Furniture");

            SystemSetting systemSetting = new SystemSetting();
            systemSetting.setSystemName("Tiffany Furniture");
            systemSetting.setPrimaryColor("#57823D");
            systemSetting.setTaxPercentage(0.0);
            systemSetting.setContactEmail("support@tiffany.com");
            systemSetting.setContactPhone("+855-0-000-0000");
            systemSetting.setContactAddress("Cambodia");

            systemSettingRepository.save(systemSetting);
            log.info("System settings initialized successfully");
        }
    }
}
