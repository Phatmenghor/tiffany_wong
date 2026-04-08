package com.tiffany.features.order.dto.response;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class OrderResponse extends BaseAuditResponse {
    private String orderNumber;

    // Customer info - from Users
    private String customerId;
    private String customerName;

    // Order details
    private OrderStatus orderStatus;
    private String customerNote;

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
