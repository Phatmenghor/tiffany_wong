package com.tiffany.features.location.dto.filter;

import com.tiffany.enums.common.Status;
import com.tiffany.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class LocationFilterRequest extends BaseFilterRequest {
    private UUID userId;
    private Status status;
}