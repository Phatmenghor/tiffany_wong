package com.tiffany.features.main.repository;

import com.tiffany.features.main.models.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Sort;

import com.tiffany.enums.product.ProductStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    /**
     * Find product by ID with details - FETCHES ONLY SIZES
     * Note: Cannot FETCH both images and sizes due to Hibernate MultipleBagFetchException
     * Images are set to empty list in service layer
     */
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.sizes sz " +
           "WHERE p.id = :id AND p.isDeleted = false " +
           "AND (sz.isDeleted = false OR sz.isDeleted IS NULL)")
    Optional<Product> findByIdWithAllDetails(@Param("id") UUID id);

    Optional<Product> findByIdAndIsDeletedFalse(UUID id);

    /**
     * Count active products in a category
     */
    @Query("SELECT COUNT(p) FROM Product p " +
           "WHERE p.categoryId = :categoryId AND p.isDeleted = false")
    long countByCategoryId(@Param("categoryId") UUID categoryId);

    /**
     * Increment product view count
     */
    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.viewCount = COALESCE(p.viewCount, 0) + 1 WHERE p.id = :productId")
    int incrementViewCount(@Param("productId") UUID productId);

    /**
     * Increment product favorite count
     */
    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.favoriteCount = COALESCE(p.favoriteCount, 0) + 1 WHERE p.id = :productId")
    void incrementFavoriteCount(@Param("productId") UUID productId);

    /**
     * Decrement product favorite count (minimum 0)
     */
    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.favoriteCount = GREATEST(0, COALESCE(p.favoriteCount, 0) - 1) WHERE p.id = :productId")
    void decrementFavoriteCount(@Param("productId") UUID productId);
    
    /**
     * Find all favorited products for a specific user
     */
    @Query("SELECT p FROM Product p " +
           "INNER JOIN ProductFavorite pf ON p.id = pf.productId " +
           "WHERE pf.userId = :userId AND p.isDeleted = false AND pf.isDeleted = false")
    Page<Product> findUserFavorites(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Find all products with dynamic filtering - OPTIMIZED FOR LIST VIEW
     * Sizes are loaded separately to avoid Hibernate pagination warning
     */
    @Query("SELECT DISTINCT p FROM Product p " +
           "WHERE p.isDeleted = false " +
           "AND (:categoryId IS NULL OR p.categoryId = :categoryId) " +
           "AND (:statuses IS NULL OR p.status IN :statuses) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findAllWithFiltersOptimized(
        @Param("categoryId") UUID categoryId,
        @Param("statuses") List<ProductStatus> statuses,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("search") String search,
        Pageable pageable
    );

    /**
     * Find all products with dynamic filtering - paginated
     * Collections are batch-loaded separately in service layer after pagination
     */
    @Query("SELECT DISTINCT p FROM Product p " +
           "WHERE p.isDeleted = false " +
           "AND (:categoryId IS NULL OR p.categoryId = :categoryId) " +
           "AND (:statuses IS NULL OR p.status IN :statuses) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findAllWithFilters(
        @Param("categoryId") UUID categoryId,
        @Param("statuses") List<ProductStatus> statuses,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("search") String search,
        Pageable pageable
    );

    /**
     * Find all products with dynamic filtering - non-paginated
     */
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.category c " +
           "LEFT JOIN FETCH p.images img " +
           "WHERE p.isDeleted = false " +
           "AND (:categoryId IS NULL OR p.categoryId = :categoryId) " +
           "AND (:statuses IS NULL OR p.status IN :statuses) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Product> findAllWithFilters(
        @Param("categoryId") UUID categoryId,
        @Param("statuses") List<ProductStatus> statuses,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("search") String search,
        Sort sort
    );

    /**
     * Clear promotion fields for products WITHOUT sizes whose promotion has expired
     * Display fields are calculated at runtime by the mapper, not stored in database
     */
    @Modifying
    @Transactional
    @Query(nativeQuery = true, value =
        "UPDATE products p SET " +
        "    promotion_type = NULL, " +
        "    promotion_value = NULL, " +
        "    promotion_from_date = NULL, " +
        "    promotion_to_date = NULL " +
        "WHERE p.is_deleted = false " +
        "  AND NOT EXISTS (SELECT 1 FROM product_sizes ps WHERE ps.product_id = p.id AND ps.is_deleted = false) " +
        "  AND ( " +
        "      p.promotion_value IS NULL " +
        "      OR p.promotion_type IS NULL " +
        "      OR (p.promotion_from_date IS NOT NULL AND p.promotion_from_date::date > CURRENT_DATE) " +
        "      OR (p.promotion_to_date   IS NOT NULL AND p.promotion_to_date::date   < CURRENT_DATE) " +
        "  )")
    int clearExpiredPromotionsForProductsWithoutSizes();

    /**
     * Sync promotion fields for products WITHOUT sizes whose promotion has just become active
     * Display fields are calculated at runtime by the mapper, not stored in database
     */
    @Modifying
    @Transactional
    @Query(nativeQuery = true, value =
        "UPDATE products p SET " +
        "    promotion_type = promotion_type, " +
        "    promotion_value = promotion_value, " +
        "    promotion_from_date = promotion_from_date, " +
        "    promotion_to_date = promotion_to_date " +
        "WHERE p.is_deleted = false " +
        "  AND NOT EXISTS (SELECT 1 FROM product_sizes ps WHERE ps.product_id = p.id AND ps.is_deleted = false) " +
        "  AND p.promotion_value IS NOT NULL " +
        "  AND p.promotion_type  IS NOT NULL " +
        "  AND (p.promotion_from_date IS NULL OR p.promotion_from_date::date <= CURRENT_DATE) " +
        "  AND (p.promotion_to_date   IS NULL OR p.promotion_to_date::date   >= CURRENT_DATE)")
    int syncStartedPromotionsForProductsWithoutSizes();

    /**
     * Sync promotion fields for products WITH sizes where at least one size has a newly active promotion
     * Display fields are calculated at runtime by the mapper, not stored in database
     * This is a no-op query kept for backwards compatibility and to trigger promotion sync logic
     */
    @Modifying
    @Transactional
    @Query(nativeQuery = true, value =
        "UPDATE products p SET " +
        "    created_by = created_by " +
        "WHERE p.is_deleted = false " +
        "  AND EXISTS (SELECT 1 FROM product_sizes ps WHERE ps.product_id = p.id AND ps.is_deleted = false) " +
        "  AND EXISTS ( " +
        "      SELECT 1 FROM product_sizes ps " +
        "      WHERE ps.product_id = p.id " +
        "        AND ps.is_deleted = false " +
        "        AND ps.promotion_value IS NOT NULL " +
        "        AND ps.promotion_type  IS NOT NULL " +
        "        AND (ps.promotion_from_date IS NULL OR ps.promotion_from_date::date <= CURRENT_DATE) " +
        "        AND (ps.promotion_to_date   IS NULL OR ps.promotion_to_date::date   >= CURRENT_DATE) " +
        "  )")
    int syncStartedPromotionsForProductsWithSizes();

    /**
     * Clear promotion fields for products WITH sizes where no size has an active promotion
     * Display fields are calculated at runtime by the mapper, not stored in database
     * This is a no-op query kept for backwards compatibility and to trigger promotion clear logic
     */
    @Modifying
    @Transactional
    @Query(nativeQuery = true, value =
        "UPDATE products p SET " +
        "    created_by = created_by " +
        "WHERE p.is_deleted = false " +
        "  AND EXISTS (SELECT 1 FROM product_sizes ps WHERE ps.product_id = p.id AND ps.is_deleted = false) " +
        "  AND NOT EXISTS ( " +
        "      SELECT 1 FROM product_sizes ps " +
        "      WHERE ps.product_id = p.id " +
        "        AND ps.is_deleted = false " +
        "        AND ps.promotion_value IS NOT NULL " +
        "        AND ps.promotion_type  IS NOT NULL " +
        "        AND (ps.promotion_from_date IS NULL OR ps.promotion_from_date::date <= CURRENT_DATE) " +
        "        AND (ps.promotion_to_date   IS NULL OR ps.promotion_to_date::date   >= CURRENT_DATE) " +
        "  )")
    int clearExpiredPromotionsForProductsWithSizes();

    /**
     * Reset promotion for a single product.
     * Display fields are calculated at runtime by the mapper, not stored in database.
     * clearAutomatically evicts stale entities from the L1 cache so subsequent reads are fresh.
     */
    @Modifying(clearAutomatically = true)
    @Query(nativeQuery = true, value =
        "UPDATE products p SET " +
        "    promotion_type = NULL, " +
        "    promotion_value = NULL, " +
        "    promotion_from_date = NULL, " +
        "    promotion_to_date = NULL " +
        "WHERE p.id = :productId " +
        "  AND p.is_deleted = false")
    int resetProductPromotionById(@Param("productId") UUID productId);

    /**
     * Bulk reset promotions for specific products (by IDs).
     * Display fields are calculated at runtime by the mapper, not stored in database.
     */
    @Modifying
    @Query(nativeQuery = true, value =
        "UPDATE products p SET " +
        "    promotion_type = NULL, " +
        "    promotion_value = NULL, " +
        "    promotion_from_date = NULL, " +
        "    promotion_to_date = NULL " +
        "WHERE p.id IN :productIds " +
        "  AND p.is_deleted = false")
    int resetPromotionsBulk(@Param("productIds") List<UUID> productIds);

    /**
     * Reset ALL promotions for products without sizes (system-wide)
     * Display fields are calculated at runtime by the mapper, not stored in database
     */
    @Modifying
    @Transactional
    @Query(nativeQuery = true, value =
        "UPDATE products SET " +
        "    promotion_type = NULL, " +
        "    promotion_value = NULL, " +
        "    promotion_from_date = NULL, " +
        "    promotion_to_date = NULL " +
        "WHERE is_deleted = false AND NOT EXISTS (SELECT 1 FROM product_sizes ps WHERE ps.product_id = products.id AND ps.is_deleted = false)")
    int resetAllPromotionsForProductsWithoutSizes();

    /**
     * Reset ALL promotions for products with sizes (system-wide)
     * Display fields are calculated at runtime by the mapper, not stored in database
     */
    @Modifying
    @Transactional
    @Query(nativeQuery = true, value =
        "UPDATE products p SET " +
        "    promotion_type = NULL, " +
        "    promotion_value = NULL, " +
        "    promotion_from_date = NULL, " +
        "    promotion_to_date = NULL " +
        "WHERE p.is_deleted = false AND EXISTS (SELECT 1 FROM product_sizes ps WHERE ps.product_id = p.id AND ps.is_deleted = false)")
    int resetAllPromotionsForProductsWithSizes();

    /**
     * Update all products in a category to a specific status
     */
    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.status = :status WHERE p.categoryId = :categoryId AND p.isDeleted = false")
    int updateProductsStatusByCategory(@Param("categoryId") UUID categoryId, @Param("status") ProductStatus status);
}