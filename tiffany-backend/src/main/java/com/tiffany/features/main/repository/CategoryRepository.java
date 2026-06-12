package com.tiffany.features.main.repository;

import com.tiffany.enums.common.Status;
import com.tiffany.enums.product.ProductStatus;
import com.tiffany.features.main.models.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    /**
     * Finds a non-deleted category by ID
     */
    Optional<Category> findByIdAndIsDeletedFalse(UUID id);


    /**
     * Checks if a non-deleted category exists with the given name
     */
    boolean existsByNameAndIsDeletedFalse(String name);

    /**
     * Find all categories with dynamic filtering - paginated
     */
    @Query("SELECT DISTINCT c FROM Category c " +
           "WHERE c.isDeleted = false " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Category> findAllWithFilters(
        @Param("status") Status status,
        @Param("search") String search,
        Pageable pageable
    );

    /**
     * Find all categories with dynamic filtering - non-paginated
     */
    @Query("SELECT DISTINCT c FROM Category c " +
           "WHERE c.isDeleted = false " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Category> findAllWithFilters(
        @Param("status") Status status,
        @Param("search") String search,
        Sort sort
    );
    /**
     * Count total (non-deleted) products per category
     */
    @Query("SELECT p.categoryId, COUNT(p.id) FROM Product p " +
           "WHERE p.categoryId IN :categoryIds AND p.isDeleted = false " +
           "GROUP BY p.categoryId")
    List<Object[]> countTotalProductsByCategories(@Param("categoryIds") List<UUID> categoryIds);

    /**
     * Count active products per category
     */
    @Query("SELECT p.categoryId, COUNT(p.id) FROM Product p " +
           "WHERE p.categoryId IN :categoryIds AND p.isDeleted = false AND p.status = :status " +
           "GROUP BY p.categoryId")
    List<Object[]> countActiveProductsByCategories(
            @Param("categoryIds") List<UUID> categoryIds,
            @Param("status") ProductStatus status);
}
