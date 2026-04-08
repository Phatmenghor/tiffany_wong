package com.emenu.features.main.dto.filter;

import com.emenu.enums.common.Status;
import com.emenu.shared.dto.BaseAllFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class CategoryAllFilterRequest extends BaseAllFilterRequest {
    private Status status;
}