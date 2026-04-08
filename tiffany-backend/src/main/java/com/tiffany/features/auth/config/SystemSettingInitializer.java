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

    private static final String PLACEHOLDER_IMAGE_URL = "https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce";

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeSystemSetting() {
        log.info("Initializing system settings...");

        if (systemSettingRepository.findAll().isEmpty()) {
            log.info("Creating default system settings for Tiffany Cambodia");

            SystemSetting systemSetting = new SystemSetting();
            systemSetting.setSystemName("Tiffany Cambodia");
            systemSetting.setLogoSystemUrl(PLACEHOLDER_IMAGE_URL);
            systemSetting.setPrimaryColor("#57823D");
            systemSetting.setTaxPercentage(0.0);
            systemSetting.setContactEmail("support@tiffanycambodia.com");
            systemSetting.setContactPhone("+855-0-000-0000");
            systemSetting.setContactAddress("Cambodia");

            systemSettingRepository.save(systemSetting);
            log.info("System settings initialized successfully");
        } else {
            log.info("System settings already configured");
        }
    }
}
