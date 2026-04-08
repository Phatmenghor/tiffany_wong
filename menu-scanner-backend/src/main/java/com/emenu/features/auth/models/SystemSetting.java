package com.emenu.features.auth.models;

import com.emenu.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * SystemSetting Entity
 * Represents system-wide settings and configuration
 * Has automatic audit fields: createdAt, updatedAt, createdBy, updatedBy, isDeleted
 */
@Entity
@Table(name = "system_settings")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"socialMedia", "businessHours"})
@ToString(exclude = {"socialMedia", "businessHours"})
@NoArgsConstructor
@AllArgsConstructor
public class SystemSetting extends BaseUUIDEntity {

    @Column(name = "tax_percentage")
    private Double taxPercentage;

    @Column(name = "system_name")
    private String systemName;

    @Column(name = "logo_system_url")
    private String logoSystemUrl;

    @Column(name = "primary_color")
    private String primaryColor;

    // Contact Information
    @Column(name = "contact_address", length = 500)
    private String contactAddress;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    // Relationships
    @OneToMany(
        mappedBy = "systemSetting",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<SocialMedia> socialMedia;

    @OneToMany(
        mappedBy = "systemSetting",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<BusinessHours> businessHours;
}
