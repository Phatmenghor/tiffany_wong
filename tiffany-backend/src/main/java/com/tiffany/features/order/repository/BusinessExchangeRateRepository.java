package com.tiffany.features.order.repository;

import com.tiffany.features.order.models.BusinessExchangeRate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessExchangeRateRepository extends JpaRepository<BusinessExchangeRate, UUID> {

    /**
     * Finds a non-deleted exchange rate by ID
     */
    Optional<BusinessExchangeRate> findByIdAndIsDeletedFalse(UUID id);

    /**
     * Finds the current active exchange rate (only one should be active at a time)
     */
    @Query("SELECT ber FROM BusinessExchangeRate ber WHERE ber.status = 'ACTIVE' AND ber.isDeleted = false")
    Optional<BusinessExchangeRate> findActiveRate();

    /**
     * Counts active exchange rates
     */
    @Query("SELECT COUNT(ber) FROM BusinessExchangeRate ber WHERE ber.status = 'ACTIVE' AND ber.isDeleted = false")
    long countActiveRates();

    /**
     * Find most recent inactive rate for fallback activation
     */
    @Query("SELECT ber FROM BusinessExchangeRate ber WHERE ber.status = 'INACTIVE' AND ber.isDeleted = false ORDER BY ber.createdAt DESC LIMIT 1")
    Optional<BusinessExchangeRate> findMostRecentInactiveRate();

    /**
     * Find all exchange rates with dynamic filtering
     */
    @Query("SELECT ber FROM BusinessExchangeRate ber " +
           "WHERE ber.isDeleted = false " +
           "AND (:status IS NULL OR ber.status = :status) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     CAST(ber.usdToKhrRate AS string) LIKE CONCAT('%', :search, '%'))")
    Page<BusinessExchangeRate> findAllWithFilters(
        @Param("status") BusinessExchangeRate.ExchangeRateStatus status,
        @Param("search") String search,
        Pageable pageable
    );

    /**
     * Deactivate all active rates
     */
    @Modifying
    @Query("UPDATE BusinessExchangeRate ber SET ber.status = 'INACTIVE' WHERE ber.status = 'ACTIVE' AND ber.isDeleted = false")
    int deactivateAllRates();

    /**
     * Deactivate all active rates except the specified one
     */
    @Modifying
    @Query("UPDATE BusinessExchangeRate ber SET ber.status = 'INACTIVE' WHERE ber.status = 'ACTIVE' AND ber.id != :excludeId AND ber.isDeleted = false")
    int deactivateAllRatesExcept(@Param("excludeId") UUID excludeId);
}
