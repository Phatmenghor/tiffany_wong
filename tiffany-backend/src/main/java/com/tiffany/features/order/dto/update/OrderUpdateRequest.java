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

/**
 * Full order update request - allows admins to modify all order details
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateRequest {

    // Customer info - editable
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    // Delivery info
    @Valid
    private DeliveryAddressRequest deliveryAddress;

    @Valid
    private DeliveryOptionRequest deliveryOption;

    // Order status
    private OrderStatus orderStatus;

    // Items update - allows modifying items
    @Valid
    private List<OrderItemUpdateRequest> items;

    // Pricing information with audit trail
    @Valid
    private PricingInfo pricing;

    // Payment information - editable
    @Valid
    private PaymentInfo payment;

    // Notes
    private String customerNote;
    private String businessNote;

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
        private BigDecimal before;
        private BigDecimal after;
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
