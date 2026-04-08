package com.tiffany.features.order.dto.response;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.features.order.enums.OrderFromEnum;
import com.tiffany.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class OrderResponse extends BaseAuditResponse {
    private String orderNumber;

    // Order source identifier
    private OrderFromEnum orderFrom;

    // Customer info
    private UUID customerId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    // Order details
    private OrderStatus orderStatus;
    private String customerNote;
    private String businessNote;

    // Pricing breakdown
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;

    // Items
    private List<OrderItemResponse> items;

    // Status history
    private List<OrderStatusHistoryResponse> statusHistory;
}
