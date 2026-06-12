package com.tiffany.features.order.repository;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.features.order.models.Order;
import com.tiffany.features.order.models.OrderStatusHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    /**
     * Finds a non-deleted order by ID with items, products, sizes, customer, and delivery address eagerly fetched
     * NOTE: statusHistory is loaded lazily to avoid MultipleBagFetchException with multiple collections
     */
    @Query("SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.items oi " +
           "LEFT JOIN FETCH oi.product p " +
           "LEFT JOIN FETCH oi.productSize ps " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.deliveryAddress " +
           "WHERE o.id = :id AND o.isDeleted = false")
    Optional<Order> findByIdWithDetails(@Param("id") UUID id);

    /**
     * Finds status history for an order with changed by user eagerly fetched
     */
    @Query("SELECT h FROM OrderStatusHistory h " +
           "LEFT JOIN FETCH h.changedByUser " +
           "WHERE h.orderId = :orderId " +
           "ORDER BY h.createdAt ASC")
    List<OrderStatusHistory> findStatusHistoryByOrderId(@Param("orderId") UUID orderId);

    /**
     * Finds all non-deleted orders by customer ID, ordered by creation date descending
     */
    @Query("SELECT o FROM Order o WHERE o.customerId = :customerId AND o.isDeleted = false ORDER BY o.createdAt DESC")
    List<Order> findByCustomerIdOrderByCreatedAtDesc(@Param("customerId") UUID customerId);

    /**
     * Finds all non-deleted orders by order status, ordered by creation date descending
     */
    @Query("SELECT o FROM Order o WHERE o.orderStatus = :orderStatus AND o.isDeleted = false ORDER BY o.createdAt DESC")
    List<Order> findByOrderStatusOrderByCreatedAtDesc(@Param("orderStatus") OrderStatus orderStatus);

    /**
     * Checks if an order exists with the given order number
     */
    boolean existsByOrderNumber(String orderNumber);

    /**
     * Counts non-deleted orders by order status
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderStatus = :orderStatus AND o.isDeleted = false")
    long countByOrderStatus(@Param("orderStatus") OrderStatus orderStatus);

    /**
     * Finds paginated non-deleted orders by customer ID with eager loading of related entities
     * Uses JOIN FETCH to prevent N+1 query problem
     * NOTE: statusHistory is loaded separately to avoid MultipleBagFetchException
     */
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.customer c " +
           "LEFT JOIN FETCH o.deliveryAddress " +
           "WHERE o.customerId = :customerId AND o.isDeleted = false " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByCustomerIdAndIsDeletedFalseOrderByCreatedAtDesc(@Param("customerId") UUID customerId, Pageable pageable);

    /**
     * Find all non-deleted orders with optional filters.
     *
     * Only the single-valued associations (customer @ManyToOne, deliveryAddress
     * @OneToOne) are JOIN FETCHed, so the database can apply real LIMIT/OFFSET
     * pagination. The items collection is intentionally NOT fetched here:
     * JOIN FETCHing a collection together with a Pageable forces Hibernate to
     * load the entire result set and paginate in memory (HHH90003004). Items
     * are instead loaded lazily in a single batched query via @BatchSize on
     * Order.items. The order-item response is built from snapshot columns, so
     * oi.product / oi.productSize are not needed at all.
     */
    @Query(value = "SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.customer c " +
           "LEFT JOIN FETCH o.deliveryAddress " +
           "WHERE o.isDeleted = false " +
           "AND (:orderStatus IS NULL OR o.orderStatus = :orderStatus) " +
           "AND (:paymentMethod IS NULL OR o.paymentMethod = :paymentMethod) " +
           "AND (:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus) " +
           "ORDER BY o.createdAt DESC",
           countQuery = "SELECT COUNT(o) FROM Order o " +
           "WHERE o.isDeleted = false " +
           "AND (:orderStatus IS NULL OR o.orderStatus = :orderStatus) " +
           "AND (:paymentMethod IS NULL OR o.paymentMethod = :paymentMethod) " +
           "AND (:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus)")
    Page<Order> findAllWithFilters(
            @Param("orderStatus") OrderStatus orderStatus,
            @Param("paymentMethod") com.tiffany.enums.payment.PaymentMethod paymentMethod,
            @Param("paymentStatus") com.tiffany.enums.payment.PaymentStatus paymentStatus,
            Pageable pageable);

    /**
     * Find paginated customer orders with optional filters.
     *
     * Same approach as findAllWithFilters: only single-valued associations are
     * JOIN FETCHed so the database performs real LIMIT/OFFSET pagination, while
     * the items collection is loaded lazily in a batched query via @BatchSize
     * on Order.items (avoids the HHH90003004 in-memory pagination warning).
     */
    @Query(value = "SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.customer c " +
           "LEFT JOIN FETCH o.deliveryAddress " +
           "WHERE o.customerId = :customerId AND o.isDeleted = false " +
           "AND (:orderStatus IS NULL OR o.orderStatus = :orderStatus) " +
           "AND (:paymentMethod IS NULL OR o.paymentMethod = :paymentMethod) " +
           "AND (:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus) " +
           "ORDER BY o.createdAt DESC",
           countQuery = "SELECT COUNT(o) FROM Order o " +
           "WHERE o.customerId = :customerId AND o.isDeleted = false " +
           "AND (:orderStatus IS NULL OR o.orderStatus = :orderStatus) " +
           "AND (:paymentMethod IS NULL OR o.paymentMethod = :paymentMethod) " +
           "AND (:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus)")
    Page<Order> findCustomerOrdersWithFilters(
            @Param("customerId") UUID customerId,
            @Param("orderStatus") OrderStatus orderStatus,
            @Param("paymentMethod") com.tiffany.enums.payment.PaymentMethod paymentMethod,
            @Param("paymentStatus") com.tiffany.enums.payment.PaymentStatus paymentStatus,
            Pageable pageable);

    /**
     * Finds all non-deleted orders with items and customer info eager loaded
     * Used for dashboard analytics
     */
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.items " +
           "LEFT JOIN FETCH o.customer " +
           "WHERE o.isDeleted = false " +
           "ORDER BY o.createdAt DESC")
    List<Order> findAllByIsDeletedFalse();

    /**
     * Counts non-deleted orders by payment status (optimized for dashboard)
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.paymentStatus = :paymentStatus AND o.isDeleted = false")
    long countByPaymentStatus(@Param("paymentStatus") com.tiffany.enums.payment.PaymentStatus paymentStatus);

    /**
     * Sum total amount of non-deleted orders by payment status (optimized for dashboard)
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = :paymentStatus AND o.isDeleted = false")
    java.math.BigDecimal sumTotalAmountByPaymentStatus(@Param("paymentStatus") com.tiffany.enums.payment.PaymentStatus paymentStatus);

    /**
     * Sum total amount of all non-deleted orders (optimized for dashboard)
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.isDeleted = false")
    java.math.BigDecimal sumTotalAmount();

    /**
     * Count all non-deleted orders (optimized for dashboard)
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.isDeleted = false")
    long countAllOrders();
}
