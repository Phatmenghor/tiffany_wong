package com.tiffany.features.spaces.model;

import com.tiffany.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "spaces_images",
        indexes = {
                @Index(name = "idx_spaces_images_created_at", columnList = "created_at"),
                @Index(name = "idx_spaces_images_object_key", columnList = "object_key")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpacesImage extends BaseUUIDEntity {

    @Column(name = "object_key", nullable = false, length = 500)
    private String objectKey;

    @Column(name = "url", nullable = false, length = 1000)
    private String url;

    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    @Column(name = "file_size")
    private Long fileSize;
}
