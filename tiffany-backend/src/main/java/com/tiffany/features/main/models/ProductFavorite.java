package com.tiffany.features.main.models;

import com.tiffany.features.auth.models.User;
import com.tiffany.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "product_favorites",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}),
        indexes = {
                @Index(name = "idx_product_favorites_user_id", columnList = "user_id"),
                @Index(name = "idx_product_favorites_product_id", columnList = "product_id"),
                @Index(name = "idx_product_favorites_user_id_is_deleted", columnList = "user_id, is_deleted"),
                @Index(name = "idx_product_favorites_created_at", columnList = "created_at")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ProductFavorite extends BaseUUIDEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    public ProductFavorite(UUID userId, UUID productId) {
        this.userId = userId;
        this.productId = productId;
    }
}