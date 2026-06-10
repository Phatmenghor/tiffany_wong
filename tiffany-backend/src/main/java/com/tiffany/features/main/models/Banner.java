package com.tiffany.features.main.models;

import com.tiffany.enums.common.Status;
import com.tiffany.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "banners",
        indexes = {
                @Index(name = "idx_banners_status", columnList = "status"),
                @Index(name = "idx_banners_is_deleted", columnList = "is_deleted"),
                @Index(name = "idx_banners_status_is_deleted", columnList = "status, is_deleted"),
                @Index(name = "idx_banners_created_at", columnList = "created_at")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Banner extends BaseUUIDEntity {

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "link_url")
    private String linkUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.ACTIVE;

    // Business Methods
    public void activate() {
        this.status = Status.ACTIVE;
    }

    public void deactivate() {
        this.status = Status.INACTIVE;
    }

    public boolean isActive() {
        return Status.ACTIVE.equals(status);
    }
}