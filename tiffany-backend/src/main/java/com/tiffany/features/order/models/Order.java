package com.tiffany.features.order.models;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.enums.payment.PaymentMethod;
import com.tiffany.enums.payment.PaymentStatus;
import com.tiffany.features.auth.models.User;
import com.tiffany.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders",
        indexes = {
                @Index(name = "idx_orders_customer_id", columnList = "customer_id"),
                @Index(name = "idx_orders_order_status", columnList = "order_status"),
                @Index(name = "idx_orders_payment_status", columnList = "payment_status"),
                @Index(name = "idx_orders_created_at", columnList = "created_at"),
                @Index(name = "idx_orders_is_deleted", columnList = "is_deleted"),
                @Index(name = "idx_orders_order_number", columnList = "order_number"),
                @Index(name = "idx_orders_customer_id_order_status", columnList = "customer_id, order_status"),
                @Index(name = "idx_orders_customer_id_is_deleted", columnList = "customer_id, is_deleted"),
                @Index(name = "idx_orders_order_status_is_deleted", columnList = "order_status, is_deleted"),
                @Index(name = "idx_orders_payment_status_is_deleted", columnList = "payment_status, is_deleted")
        })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Order extends BaseUUIDEntity {

    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;

    // Customer Info
    @Column(name = "customer_id")
    private UUID customerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private User customer;

    // ===== Delivery Address Snapshots =====
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private OrderDeliveryAddress deliveryAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus = OrderStatus.PENDING;

    // Customer contact info - captured at checkout time
    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(name = "customer_email")
    private String customerEmail;

    @Column(name = "customer_note", columnDefinition = "TEXT")
    private String customerNote;

    // Pricing
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;           // Items total before discounts

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO; // Total discount applied

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;        // Final = subtotal - discount

    // Payment info
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    // Order items.
    // @BatchSize lets Hibernate load items for many orders in a single IN(...)
    // query instead of one query per order (N+1). This allows the paginated
    // list query to fetch order roots at the DB level (real LIMIT/OFFSET) and
    // load items lazily in batches, avoiding the in-memory pagination warning
    // (HHH90003004) that a JOIN FETCH on this collection would cause.
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @BatchSize(size = 50)
    private List<OrderItem> items = new ArrayList<>();

    // Business Methods
    public void updateStatus(OrderStatus newStatus) {
        this.orderStatus = newStatus;
    }

    public void markAsPaid() {
        this.paymentStatus = PaymentStatus.PAID;
    }

    public void markAsUnpaid() {
        this.paymentStatus = PaymentStatus.UNPAID;
    }

    public void markAsRefunded() {
        this.paymentStatus = PaymentStatus.REFUNDED;
    }
}
