package com.tiffany.features.order.dto.filter;

import com.tiffany.features.order.models.BusinessExchangeRate;
import com.tiffany.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class BusinessExchangeRateFilterRequest extends BaseFilterRequest {
    private BusinessExchangeRate.ExchangeRateStatus status;
}