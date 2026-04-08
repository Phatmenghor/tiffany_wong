package com.tiffany.features.order.service;

import com.tiffany.features.order.dto.filter.BusinessExchangeRateFilterRequest;
import com.tiffany.features.order.dto.request.BusinessExchangeRateCreateRequest;
import com.tiffany.features.order.dto.response.BusinessExchangeRateResponse;
import com.tiffany.features.order.dto.update.BusinessExchangeRateUpdateRequest;
import com.tiffany.shared.dto.PaginationResponse;

import java.util.UUID;

public interface BusinessExchangeRateService {
    
    /**
     * Create new business exchange rate (deactivates previous active rate for the business)
     */
    BusinessExchangeRateResponse createBusinessExchangeRate(BusinessExchangeRateCreateRequest request);
    
    /**
     * Get all business exchange rates with filtering and pagination
     */
    PaginationResponse<BusinessExchangeRateResponse> getAllBusinessExchangeRates(BusinessExchangeRateFilterRequest filter);
    
    /**
     * Get business exchange rate by ID
     */
    BusinessExchangeRateResponse getBusinessExchangeRateById(UUID id);
    
    /**
     * Update business exchange rate
     */
    BusinessExchangeRateResponse updateBusinessExchangeRate(UUID id, BusinessExchangeRateUpdateRequest request);
    
    /**
     * Delete business exchange rate
     */
    BusinessExchangeRateResponse deleteBusinessExchangeRate(UUID id);
    
    /**
     * Get current active exchange rate (system-wide, only one active rate exists)
     */
    BusinessExchangeRateResponse getActiveRate();
}