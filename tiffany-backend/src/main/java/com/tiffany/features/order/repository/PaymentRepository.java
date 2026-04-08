package com.tiffany.features.order.repository;

import com.tiffany.enums.payment.PaymentMethod;
import com.tiffany.enums.payment.PaymentStatus;
import com.tiffany.features.order.models.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    /**
     * Finds a non-deleted payment by ID
     */
    Optional<Payment> findByIdAndIsDeletedFalse(UUID id);

    /**
     * Finds a payment by ID with business, plan, and subscription details eagerly fetched
     */
    @Query("""
                SELECT p FROM Payment p
                LEFT JOIN FETCH p.business
                LEFT JOIN FETCH p.plan
                LEFT JOIN FETCH p.subscription
                WHERE p.id = :id
            """)
    Optional<Payment> findByIdWithRelationships(@Param("id") UUID id);

    /**
     * Searches payments with filters for plan, payment methods, statuses, date range, and text search
     */
    @Query("""
                SELECT p FROM Payment p
                LEFT JOIN p.business b
                LEFT JOIN p.plan pl
                WHERE p.isDeleted = false
                AND (:planId IS NULL OR p.planId = :planId)
                AND (:paymentMethods IS NULL OR p.paymentMethod IN :paymentMethods)
                AND (:statuses IS NULL OR p.status IN :statuses)
                AND (:createdFrom IS NULL OR CAST(p.createdAt AS date) >= :createdFrom)
                AND (:createdTo IS NULL OR CAST(p.createdAt AS date) <= :createdTo)
                AND (:search IS NULL OR :search = '' OR
                     LOWER(p.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(pl.name) LIKE LOWER(CONCAT('%', :search, '%')))
                ORDER BY p.createdAt DESC
            """)
    Page<Payment> findAllWithFilters(
            @Param("planId") UUID planId,
            @Param("paymentMethods") List<PaymentMethod> paymentMethods,
            @Param("statuses") List<PaymentStatus> statuses,
            @Param("createdFrom") LocalDate createdFrom,
            @Param("createdTo") LocalDate createdTo,
            @Param("search") String search,
            Pageable pageable
    );

    /**
     * Finds all non-deleted payments by subscription ID
     */
    @Query("SELECT p FROM Payment p WHERE p.subscriptionId = :subscriptionId AND p.isDeleted = false")
    List<Payment> findBySubscriptionIdAndIsDeletedFalse(@Param("subscriptionId") UUID subscriptionId);

    /**
     * Finds non-deleted payments by subscription ID and status
     */
    @Query("""
                SELECT p FROM Payment p
                WHERE p.subscriptionId = :subscriptionId
                AND p.status = :status
                AND p.isDeleted = false
            """)
    List<Payment> findBySubscriptionIdAndStatusAndIsDeletedFalse(
            @Param("subscriptionId") UUID subscriptionId,
            @Param("status") PaymentStatus status
    );
}