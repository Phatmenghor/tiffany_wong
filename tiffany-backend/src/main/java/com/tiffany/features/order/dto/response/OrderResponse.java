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
    private String customerId;
    private String customerName;
    private OrderStatus orderStatus;
    private String customerNote;

    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;

    private List<OrderItemResponse> items;
    private List<OrderStatusHistoryResponse> statusHistory;
}
