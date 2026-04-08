package com.tiffany.features.main.controller;

import com.tiffany.features.main.dto.filter.ProductFilterDto;
import com.tiffany.features.main.dto.response.FavoriteRemoveAllDto;
import com.tiffany.features.main.dto.response.FavoriteToggleDto;
import com.tiffany.features.main.dto.response.ProductListDto;
import com.tiffany.features.main.service.ProductFavoriteService;
import com.tiffany.shared.dto.ApiResponse;
import com.tiffany.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/product-favorites")
@RequiredArgsConstructor
@Slf4j
public class ProductFavoriteController {

    private final ProductFavoriteService favoriteService;

    /**
     * Toggle favorite status for a product
     */
    @PostMapping("/{productId}/toggle")
    public ResponseEntity<ApiResponse<FavoriteToggleDto>> toggleFavorite(@PathVariable UUID productId) {
        long startTime = System.currentTimeMillis();
        log.info("POST /api/v1/product-favorites/{}/toggle - Toggle favorite request", productId);

        try {
            FavoriteToggleDto result = favoriteService.toggleFavorite(productId);
            long duration = System.currentTimeMillis() - startTime;

            log.info("POST /api/v1/product-favorites/{}/toggle succeeded in {}ms - Action: {}, Status: {}",
                productId, duration, result.getAction(), result.getIsFavorited());
            return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("POST /api/v1/product-favorites/{}/toggle failed after {}ms - Error: {}",
                productId, duration, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get paginated list of user's favorite products
     */
    @PostMapping("/my-favorites")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductListDto>>> getUserFavorites(
            @Valid @RequestBody ProductFilterDto filter) {

        long startTime = System.currentTimeMillis();
        log.info("POST /api/v1/product-favorites/my-favorites - Get user favorites - Page: {}, Size: {}",
            filter.getPageNo(), filter.getPageSize());

        try {
            PaginationResponse<ProductListDto> favorites = favoriteService.getUserFavorites(filter);
            long duration = System.currentTimeMillis() - startTime;

            log.info("POST /api/v1/product-favorites/my-favorites succeeded in {}ms - Retrieved {} favorites, Total: {}",
                duration, favorites.getContent().size(), favorites.getTotalElements());
            return ResponseEntity.ok(ApiResponse.success("Favorite products retrieved successfully", favorites));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("POST /api/v1/product-favorites/my-favorites failed after {}ms - Error: {}",
                duration, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Remove all favorites for current user
     */
    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<FavoriteRemoveAllDto>> removeAllFavorites() {
        long startTime = System.currentTimeMillis();
        log.info("DELETE /api/v1/product-favorites/all - Remove all favorites");

        try {
            FavoriteRemoveAllDto result = favoriteService.removeAllFavorites();
            long duration = System.currentTimeMillis() - startTime;

            log.info("DELETE /api/v1/product-favorites/all succeeded in {}ms - Removed {} favorites",
                duration, result.getRemovedCount());
            return ResponseEntity.ok(ApiResponse.success("All favorites removed successfully", result));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("DELETE /api/v1/product-favorites/all failed after {}ms - Error: {}",
                duration, e.getMessage(), e);
            throw e;
        }
    }
}
