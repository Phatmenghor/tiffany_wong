package com.tiffany.features.main.service;

import com.tiffany.features.main.dto.filter.BannerFilterRequest;
import com.tiffany.features.main.dto.filter.BannerAllFilterRequest;
import com.tiffany.features.main.dto.request.BannerCreateRequest;
import com.tiffany.features.main.dto.response.BannerResponse;
import com.tiffany.features.main.dto.update.BannerUpdateRequest;
import com.tiffany.shared.dto.PaginationResponse;

import java.util.List;
import java.util.UUID;

public interface BannerService {
    
    // CRUD Operations
    BannerResponse createBanner(BannerCreateRequest request);
    PaginationResponse<BannerResponse> getAllBanners(BannerFilterRequest filter);
    List<BannerResponse> getAllItemBanners(BannerAllFilterRequest filter);
    BannerResponse getBannerById(UUID id);
    BannerResponse updateBanner(UUID id, BannerUpdateRequest request);
    BannerResponse deleteBanner(UUID id);
}