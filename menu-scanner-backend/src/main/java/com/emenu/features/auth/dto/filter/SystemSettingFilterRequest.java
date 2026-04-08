package com.emenu.features.auth.dto.filter;

import com.emenu.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SystemSettingFilterRequest extends BaseFilterRequest {
    private String search;
}
