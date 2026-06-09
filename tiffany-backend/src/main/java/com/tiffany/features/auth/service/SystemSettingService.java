package com.tiffany.features.auth.service;

import com.tiffany.features.auth.dto.response.SystemSettingResponse;
import com.tiffany.features.auth.dto.update.SystemSettingUpdateRequest;

public interface SystemSettingService {
    SystemSettingResponse getSystemSetting();
    SystemSettingResponse updateSystemSetting(SystemSettingUpdateRequest request);
}
