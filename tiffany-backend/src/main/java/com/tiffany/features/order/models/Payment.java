package com.tiffany.features.order.models;

import com.tiffany.enums.payment.PaymentMethod;
import com.tiffany.enums.payment.PaymentStatus;
import com.tiffany.enums.payment.PaymentType;
import com.tiffany.shared.domain.BaseUUIDEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Payment extends BaseUUIDEntity {

    private String imageUrl;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "amount_khr", precision = 15, scale = 2)
    private BigDecimal amountKhr;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false)
    private PaymentType paymentType = PaymentType.OTHER;

    @Column(name = "reference_number")
    private String referenceNumber;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public void calculateAmountKhr(Double exchangeRate) {
        if (amount != null && exchangeRate != null && exchangeRate > 0) {
            this.amountKhr = amount.multiply(BigDecimal.valueOf(exchangeRate))
                    .setScale(2, RoundingMode.HALF_UP);
        }
    }

    public String getFormattedAmount() {
        return amount != null ? String.format("$%.2f", amount) : "$0.00";
    }

    public String getFormattedAmountKhr() {
        return amountKhr != null ? String.format("៛%.0f", amountKhr) : "៛0";
    }

    public void markAsCompleted() {
        this.status = PaymentStatus.COMPLETED;
    }

    public void markAsFailed() {
        this.status = PaymentStatus.FAILED;
    }

    public void markAsPending() {
        this.status = PaymentStatus.PENDING;
    }
}