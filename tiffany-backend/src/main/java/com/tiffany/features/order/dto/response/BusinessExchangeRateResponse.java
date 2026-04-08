package com.tiffany.features.order.dto.response;

import com.tiffany.enums.common.Status;
import com.tiffany.features.order.models.BusinessExchangeRate;
import com.tiffany.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class BusinessExchangeRateResponse extends BaseAuditResponse {

    // Required: USD to KHR
    private Double usdToKhrRate;

    // Optional currencies
    private Double usdToCnyRate;
    private Double usdToVndRate;

    private Status status;
    private String notes;
}