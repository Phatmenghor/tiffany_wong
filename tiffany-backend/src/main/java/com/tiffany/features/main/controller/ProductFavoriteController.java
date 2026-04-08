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

    @PostMapping("/{productId}/toggle")
    public ResponseEntity<ApiResponse<FavoriteToggleDto>> toggleFavorite(@PathVariable UUID productId) {
        log.info("Toggling favorite: productId={}", productId);
        FavoriteToggleDto result = favoriteService.toggleFavorite(productId);
        log.info("Favorite toggled: action={}, isFavorited={}", result.getAction(), result.getIsFavorited());
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }

    @PostMapping("/my-favorites")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductListDto>>> getUserFavorites(
            @Valid @RequestBody ProductFilterDto filter) {
        log.info("Getting user favorites");
        PaginationResponse<ProductListDto> favorites = favoriteService.getUserFavorites(filter);
        return ResponseEntity.ok(ApiResponse.success("Favorite products retrieved successfully", favorites));
    }

    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<FavoriteRemoveAllDto>> removeAllFavorites() {
        log.info("Removing all favorites");
        FavoriteRemoveAllDto result = favoriteService.removeAllFavorites();
        log.info("All favorites removed: count={}", result.getRemovedCount());
        return ResponseEntity.ok(ApiResponse.success("All favorites removed successfully", result));
    }
}
