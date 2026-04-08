package com.tiffany.features.order.dto.response;

import com.tiffany.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class ExchangeRateResponse extends BaseAuditResponse {
    private Double usdToKhrRate;
    private Boolean isActive;
    private String notes;
}