package com.tiffany.features.main.dto.filter;

import com.tiffany.enums.common.Status;
import com.tiffany.shared.dto.BaseAllFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class CategoryAllFilterRequest extends BaseAllFilterRequest {
    private Status status;
}