package com.tiffany.features.order.service;

import com.tiffany.features.order.dto.filter.ExchangeRateFilterRequest;
import com.tiffany.features.order.dto.request.ExchangeRateCreateRequest;
import com.tiffany.features.order.dto.response.ExchangeRateResponse;
import com.tiffany.features.order.dto.update.ExchangeRateUpdateRequest;
import com.tiffany.shared.dto.PaginationResponse;

import java.util.UUID;

public interface ExchangeRateService {
    
    // Basic CRUD Operations
    ExchangeRateResponse createExchangeRate(ExchangeRateCreateRequest request);
    PaginationResponse<ExchangeRateResponse> getAllExchangeRates(ExchangeRateFilterRequest filter);
    ExchangeRateResponse getExchangeRateById(UUID id);
    ExchangeRateResponse updateExchangeRate(UUID id, ExchangeRateUpdateRequest request);
    ExchangeRateResponse deleteExchangeRate(UUID id);
    
    // System Rate Operations
    ExchangeRateResponse getCurrentActiveRate();
}