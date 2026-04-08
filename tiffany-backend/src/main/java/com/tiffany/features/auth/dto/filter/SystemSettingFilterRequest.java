package com.tiffany.features.auth.dto.filter;

import com.tiffany.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SystemSettingFilterRequest extends BaseFilterRequest {
    private String search;
}
