package com.emenu.features.auth.dto.response;

import com.emenu.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class BusinessHoursResponse extends BaseAuditResponse {

    private UUID id;
    private UUID systemSettingId;
    private String day;
    private String openingTime;
    private String closingTime;
}
