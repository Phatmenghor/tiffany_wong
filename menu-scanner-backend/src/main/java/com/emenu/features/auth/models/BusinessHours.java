package com.emenu.features.auth.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.UUID;

/**
 * BusinessHours Entity
 * Represents business operating hours for each day of the week
 * Has automatic audit fields: createdAt, updatedAt, createdBy, updatedBy, isDeleted
 */
@Entity
@Table(name = "business_hours")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "systemSetting")
@ToString(exclude = "systemSetting")
@NoArgsConstructor
@AllArgsConstructor
public class BusinessHours extends BaseUUIDEntity {

    @Column(name = "system_setting_id", nullable = false)
    private UUID systemSettingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "system_setting_id", insertable = false, updatable = false)
    private SystemSetting systemSetting;

    @Column(name = "day", nullable = false)
    private String day;

    @Column(name = "opening_time")
    private String openingTime;

    @Column(name = "closing_time")
    private String closingTime;
}
