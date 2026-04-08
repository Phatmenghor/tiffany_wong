package com.tiffany.features.order.dto.filter;

import com.tiffany.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class ExchangeRateFilterRequest extends BaseFilterRequest {
    private Boolean isActive;
}