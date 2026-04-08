package com.tiffany.features.main.service;

import com.tiffany.features.main.dto.filter.ProductFilterDto;
import com.tiffany.features.main.dto.response.FavoriteRemoveAllDto;
import com.tiffany.features.main.dto.response.FavoriteToggleDto;
import com.tiffany.features.main.dto.response.ProductListDto;
import com.tiffany.shared.dto.PaginationResponse;

import java.util.UUID;

public interface ProductFavoriteService {
    FavoriteToggleDto toggleFavorite(UUID productId);
    PaginationResponse<ProductListDto> getUserFavorites(ProductFilterDto filter);
    FavoriteRemoveAllDto removeAllFavorites();
}
