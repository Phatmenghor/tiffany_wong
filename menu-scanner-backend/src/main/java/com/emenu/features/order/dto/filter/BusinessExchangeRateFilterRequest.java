package com.emenu.features.order.dto.filter;

import com.emenu.features.order.models.BusinessExchangeRate;
import com.emenu.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class BusinessExchangeRateFilterRequest extends BaseFilterRequest {
    private BusinessExchangeRate.ExchangeRateStatus status;
}