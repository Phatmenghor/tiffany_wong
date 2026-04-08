package com.tiffany.features.order.dto.helper;

import com.tiffany.enums.payment.PaymentMethod;
import com.tiffany.enums.payment.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateHelper {
    private String orderNumber;
    private UUID customerId;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String customerNote;

    // ===== Delivery Address Fields =====
    private String deliveryVillage;
    private String deliveryCommune;
    private String deliveryDistrict;
    private String deliveryProvince;
    private String deliveryStreetNumber;
    private String deliveryHouseNumber;
    private String deliveryNote;
    private BigDecimal deliveryLatitude;
    private BigDecimal deliveryLongitude;

    // ===== Delivery Option Fields =====
    private String deliveryOptionName;
    private String deliveryOptionDescription;
    private String deliveryOptionImageUrl;
    private BigDecimal deliveryOptionPrice;
    private BigDecimal deliveryFee;

    // Pricing - initialized with defaults, updated after items are processed
    private BigDecimal subtotal;
    private BigDecimal totalAmount;
}
