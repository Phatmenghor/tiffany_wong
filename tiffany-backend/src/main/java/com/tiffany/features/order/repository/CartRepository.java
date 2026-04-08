package com.tiffany.features.order.repository;

import com.tiffany.features.order.models.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {

    /**
     * Finds a non-deleted cart by user ID with items, products, and sizes eagerly fetched
     */
    @Query("SELECT DISTINCT c FROM Cart c " +
           "LEFT JOIN FETCH c.items ci " +
           "LEFT JOIN FETCH ci.product p " +
           "LEFT JOIN FETCH ci.productSize ps " +
           "WHERE c.userId = :userId AND c.isDeleted = false " +
           "ORDER BY c.updatedAt DESC")
    Optional<Cart> findByUserIdWithItems(@Param("userId") UUID userId);

    /**
     * Finds a non-deleted cart by user ID
     */
    Optional<Cart> findByUserIdAndIsDeletedFalse(UUID userId);

    /**
     * Counts total quantity of active products in a user's cart
     */
    @Query("SELECT COALESCE(SUM(ci.quantity), 0) FROM Cart c " +
            "JOIN c.items ci " +
            "JOIN ci.product p " +
            "WHERE c.userId = :userId AND c.isDeleted = false " +
            "AND ci.isDeleted = false AND p.isDeleted = false AND p.status = 'ACTIVE'")
    Long countItemsByUserId(@Param("userId") UUID userId);
}