package com.tiffany.features.main.models;

import com.tiffany.enums.product.ProductStatus;
import com.tiffany.enums.product.PromotionType;
import com.tiffany.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products",
        indexes = {
                @Index(name = "idx_products_category_id", columnList = "category_id"),
                @Index(name = "idx_products_status", columnList = "status"),
                @Index(name = "idx_products_is_deleted", columnList = "is_deleted"),
                @Index(name = "idx_products_status_is_deleted", columnList = "status, is_deleted")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Product extends BaseUUIDEntity {

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "promotion_type")
    private PromotionType promotionType;

    @Column(name = "promotion_value", precision = 10, scale = 2)
    private BigDecimal promotionValue;

    @Column(name = "promotion_from_date")
    private LocalDate promotionFromDate;

    @Column(name = "promotion_to_date")
    private LocalDate promotionToDate;


    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    @Column(name = "favorite_count", nullable = false)
    private Long favoriteCount = 0L;

    @Column(name = "main_image_url")
    private String mainImageUrl;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @OrderBy("price ASC")
    private List<ProductSize> sizes = new ArrayList<>();

    public BigDecimal getFinalPrice() {
        if (!isPromotionActive()) {
            return this.price != null ? this.price : BigDecimal.ZERO;
        }

        BigDecimal basePrice = this.price != null ? this.price : BigDecimal.ZERO;

        switch (promotionType) {
            case PERCENTAGE -> {
                BigDecimal discount = basePrice.multiply(promotionValue)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                return basePrice.subtract(discount);
            }
            case FIXED_AMOUNT -> {
                BigDecimal finalPrice = basePrice.subtract(promotionValue);
                return finalPrice.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : finalPrice;
            }
            default -> {
                return basePrice;
            }
        }
    }

    public boolean isPromotionActive() {
        if (promotionValue == null || promotionType == null) {
            return false;
        }

        LocalDate today = LocalDate.now();

        if (promotionFromDate != null && today.isBefore(promotionFromDate)) {
            return false;
        }

        if (promotionToDate != null && today.isAfter(promotionToDate)) {
            return false;
        }

        return true;
    }

    public void incrementViewCount() {
        this.viewCount = (this.viewCount == null ? 0L : this.viewCount) + 1;
    }

    public void incrementFavoriteCount() {
        this.favoriteCount = (this.favoriteCount == null ? 0L : this.favoriteCount) + 1;
    }

    public void decrementFavoriteCount() {
        this.favoriteCount = Math.max(0L, (this.favoriteCount == null ? 0L : this.favoriteCount) - 1);
    }

    public List<ProductImage> getImages() {
        if (this.images == null) {
            this.images = new ArrayList<>();
        }
        return this.images;
    }

    public List<ProductSize> getSizes() {
        if (this.sizes == null) {
            this.sizes = new ArrayList<>();
        }
        return this.sizes;
    }

    public boolean isActive() {
        return ProductStatus.ACTIVE.equals(status);
    }

    public boolean isAvailable() {
        return ProductStatus.ACTIVE.equals(status);
    }
}