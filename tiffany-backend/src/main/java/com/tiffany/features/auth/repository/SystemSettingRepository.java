package com.tiffany.features.auth.repository;

import com.tiffany.features.auth.models.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, UUID>, JpaSpecificationExecutor<SystemSetting> {
    Optional<SystemSetting> findByIdAndIsDeletedFalse(UUID id);
}
