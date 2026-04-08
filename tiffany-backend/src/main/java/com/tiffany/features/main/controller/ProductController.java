package com.tiffany.features.main.controller;

import com.tiffany.features.main.dto.filter.ProductFilterDto;
import com.tiffany.features.main.dto.request.ProductCreateDto;
import com.tiffany.features.main.dto.request.BulkPromotionCreateDto;
import com.tiffany.features.main.dto.request.ResetSelectedPromotionsDto;
import com.tiffany.features.main.dto.response.ProductDetailDto;
import com.tiffany.features.main.dto.response.BulkPromotionResultDto;
import com.tiffany.features.main.dto.update.ProductUpdateDto;
import com.tiffany.features.main.service.ProductService;
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
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    @PostMapping("/admin/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductDetailDto>>> getAllProductAdmin(
            @Valid @RequestBody ProductFilterDto filter) {

        log.info("Get products by admin - Page: {}, Size: {}", filter.getPageNo(), filter.getPageSize());

        PaginationResponse<ProductDetailDto> products = productService.getAllProductsAdmin(filter);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Found %d products", products.getTotalElements()),
                products
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailDto>> getProductById(@PathVariable UUID id) {
        log.info("Getting product: id={}", id);
        ProductDetailDto product = productService.getProductById(id);
        log.info("Product retrieved: id={}", product.getId());
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDetailDto>> createProduct(
            @Valid @RequestBody ProductCreateDto request) {
        log.info("Creating product: {}", request.getName());
        ProductDetailDto product = productService.createProduct(request);
        log.info("Product created: id={}", product.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailDto>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductUpdateDto request) {
        log.info("Updating product: id={}", id);
        ProductDetailDto product = productService.updateProduct(id, request);
        log.info("Product updated: id={}", product.getId());
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailDto>> deleteProduct(@PathVariable UUID id) {
        log.info("Deleting product: id={}", id);
        ProductDetailDto product = productService.deleteProduct(id);
        log.info("Product deleted: id={}", product.getId());
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", product));
    }

    @PutMapping("/{id}/reset-promotion")
    public ResponseEntity<ApiResponse<ProductDetailDto>> resetProductPromotion(@PathVariable UUID id) {
        log.info("Resetting product promotion: id={}", id);
        ProductDetailDto product = productService.resetProductPromotion(id);
        log.info("Product promotion reset: id={}", product.getId());
        return ResponseEntity.ok(ApiResponse.success("Product promotion reset successfully", product));
    }

    @PutMapping("/reset-all-promotions")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> resetAllPromotions() {
        log.info("Reset all promotions for current business");

        java.util.Map<String, Object> result = productService.resetAllPromotions();

        return ResponseEntity.ok(ApiResponse.success("All promotions reset successfully", result));
    }

    @PutMapping("/reset-selected-promotions")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> resetSelectedPromotions(
            @Valid @RequestBody ResetSelectedPromotionsDto request) {
        log.info("Resetting selected promotions: count={}", request.getProductIds().size());
        java.util.Map<String, Object> result = productService.resetSelectedPromotions(request);
        log.info("Selected promotions reset");
        return ResponseEntity.ok(ApiResponse.success("Selected promotions reset successfully", result));
    }

    @PostMapping("/bulk-create-promotions")
    public ResponseEntity<ApiResponse<BulkPromotionResultDto>> createBulkPromotions(
            @Valid @RequestBody BulkPromotionCreateDto request) {
        log.info("Creating bulk promotions: count={}", request.getProductIds().size());
        BulkPromotionResultDto result = productService.createBulkPromotions(request);
        log.info("Bulk promotions created: success={}, failed={}", result.getSuccessCount(), result.getFailedCount());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bulk promotion creation completed", result));
    }

}