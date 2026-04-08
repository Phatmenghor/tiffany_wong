package com.tiffany.features.main.repository;

import com.tiffany.enums.common.Status;
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
     * Get product counts for multiple categories in a single query (optimized)
     */
    @Query("SELECT c.id, COUNT(p.id) FROM Category c " +
           "LEFT JOIN Product p ON p.categoryId = c.id AND p.isDeleted = false " +
           "WHERE c.id IN :categoryIds AND c.isDeleted = false " +
           "GROUP BY c.id")
    List<Object[]> countProductsForCategories(@Param("categoryIds") List<UUID> categoryIds);

    /**
     * Get total and active product counts for multiple categories in a single query (optimized)
     */
    @Query("SELECT c.id, " +
           "COUNT(p.id) as total_count, " +
           "COUNT(CASE WHEN p.status = 'ACTIVE' THEN p.id END) as active_count " +
           "FROM Category c " +
           "LEFT JOIN Product p ON p.categoryId = c.id AND p.isDeleted = false " +
           "WHERE c.id IN :categoryIds AND c.isDeleted = false " +
           "GROUP BY c.id")
    List<Object[]> countTotalAndActiveProductsForCategories(@Param("categoryIds") List<UUID> categoryIds);
}
