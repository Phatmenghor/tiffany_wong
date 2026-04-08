package com.tiffany.features.auth.repository;

import com.tiffany.features.auth.models.BusinessHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessHoursRepository extends JpaRepository<BusinessHours, UUID> {
    List<BusinessHours> findBySystemSettingIdAndIsDeletedFalse(UUID systemSettingId);
    Optional<BusinessHours> findByIdAndIsDeletedFalse(UUID id);
}
