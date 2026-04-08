package com.tiffany.features.order.dto.update;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.enums.payment.PaymentMethod;
import com.tiffany.enums.payment.PaymentStatus;
import com.tiffany.features.order.dto.request.DeliveryAddressRequest;
import com.tiffany.features.order.dto.request.DeliveryOptionRequest;
import com.tiffany.features.order.dto.request.OrderItemUpdateRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateRequest {

    private OrderStatus orderStatus;

    @Valid
    private DeliveryAddressRequest deliveryAddress;

    @Valid
    private DeliveryOptionRequest deliveryOption;

    @Valid
    private List<OrderItemUpdateRequest> items;

    @Valid
    private PricingInfo pricing;

    @Valid
    private PaymentInfo payment;

    private String customerNote;

    // ─── Nested Classes ───
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingInfo {
        // Type of order-level discount (PERCENTAGE or FIXED_AMOUNT)
        private String discountType;

        // Reason for order-level change
        private String orderLevelChangeReason;

        // Flag indicating if there were POS-level changes to pricing
        private Boolean hadOrderLevelChangeFromPOS;

        // Pricing snapshots for tracking changes
        private PricingSnapshot before;
        private PricingSnapshot after;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingSnapshot {
        private BigDecimal discountAmount;
        private BigDecimal taxAmount;
        private BigDecimal deliveryFee;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInfo {
        private String paymentMethod;  // CASH, CARD, etc.
        private String paymentStatus;  // PAID, UNPAID, etc.
    }
}
