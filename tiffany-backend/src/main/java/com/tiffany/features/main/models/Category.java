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
@Table(name = "categories",
        indexes = {
                @Index(name = "idx_categories_status", columnList = "status"),
                @Index(name = "idx_categories_is_deleted", columnList = "is_deleted"),
                @Index(name = "idx_categories_name", columnList = "name"),
                @Index(name = "idx_categories_status_is_deleted", columnList = "status, is_deleted")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Category extends BaseUUIDEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "image_url")
    private String imageUrl;

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