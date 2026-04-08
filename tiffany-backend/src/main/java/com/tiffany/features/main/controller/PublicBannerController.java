package com.tiffany.features.main.controller;

import com.tiffany.features.main.dto.filter.BannerAllFilterRequest;
import com.tiffany.features.main.dto.response.BannerResponse;
import com.tiffany.features.main.service.BannerService;
import com.tiffany.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/banners")
@RequiredArgsConstructor
@Slf4j
public class PublicBannerController {
    private final BannerService bannerService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getMyBusinessAllBanners(@Valid @RequestBody BannerAllFilterRequest filter) {
        log.info("Getting banners");
        List<BannerResponse> banners = bannerService.getAllItemBanners(filter);
        return ResponseEntity.ok(ApiResponse.success("Banners retrieved successfully", banners));
    }
}
