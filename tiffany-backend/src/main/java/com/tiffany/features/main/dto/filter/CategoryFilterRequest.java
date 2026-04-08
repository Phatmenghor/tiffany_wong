package com.tiffany.features.main.dto.filter;

import com.tiffany.enums.common.Status;
import com.tiffany.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class CategoryFilterRequest extends BaseFilterRequest {
    private Status status;
}

