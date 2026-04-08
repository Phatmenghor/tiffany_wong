package com.tiffany.features.main.controller;

import com.tiffany.features.main.dto.filter.BannerFilterRequest;
import com.tiffany.features.main.dto.request.BannerCreateRequest;
import com.tiffany.features.main.dto.response.BannerResponse;
import com.tiffany.features.main.dto.update.BannerUpdateRequest;
import com.tiffany.features.main.service.BannerService;
import com.tiffany.shared.dto.ApiResponse;
import com.tiffany.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/banners")
@RequiredArgsConstructor
@Slf4j
public class BannerController {

    private final BannerService bannerService;

    @PostMapping
    public ResponseEntity<ApiResponse<BannerResponse>> createBanner(@Valid @RequestBody BannerCreateRequest request) {
        log.info("Creating banner");
        BannerResponse banner = bannerService.createBanner(request);
        log.info("Banner created: id={}", banner.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Banner created successfully", banner));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BannerResponse>>> getAllBanners(@Valid @RequestBody BannerFilterRequest filter) {
        log.info("Getting banners");
        PaginationResponse<BannerResponse> banners = bannerService.getAllBanners(filter);
        return ResponseEntity.ok(ApiResponse.success("Banners retrieved successfully", banners));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> getBannerById(@PathVariable UUID id) {
        log.info("Getting banner: id={}", id);
        BannerResponse banner = bannerService.getBannerById(id);
        return ResponseEntity.ok(ApiResponse.success("Banner retrieved successfully", banner));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> updateBanner(
            @PathVariable UUID id,
            @Valid @RequestBody BannerUpdateRequest request) {
        log.info("Updating banner: id={}", id);
        BannerResponse banner = bannerService.updateBanner(id, request);
        log.info("Banner updated: id={}", banner.getId());
        return ResponseEntity.ok(ApiResponse.success("Banner updated successfully", banner));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> deleteBanner(@PathVariable UUID id) {
        log.info("Deleting banner: id={}", id);
        BannerResponse banner = bannerService.deleteBanner(id);
        log.info("Banner deleted: id={}", banner.getId());
        return ResponseEntity.ok(ApiResponse.success("Banner deleted successfully", banner));
    }
}