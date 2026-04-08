package com.emenu.features.auth.config;

import com.emenu.features.auth.models.SystemSetting;
import com.emenu.features.auth.repository.SystemSettingRepository;
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
        log.info("🔄 Checking system settings...");

        // Check if system setting exists
        if (systemSettingRepository.findAll().isEmpty()) {
            log.info("📝 Creating default system setting...");

            SystemSetting systemSetting = new SystemSetting();
            systemSetting.setSystemName("Emenu Scanner");
            systemSetting.setPrimaryColor("#57823D");
            systemSetting.setTaxPercentage(0.0);
            systemSetting.setContactEmail("contact@emenu.com");

            systemSettingRepository.save(systemSetting);
            log.info("✅ Default system setting created successfully");
        } else {
            log.info("✅ System setting already exists");
        }
    }
}
