package com.tiffany.features.main.controller;

import com.tiffany.features.main.dto.filter.ProductFilterDto;
import com.tiffany.features.main.dto.response.ProductDetailDto;
import com.tiffany.features.main.dto.response.ProductListDto;
import com.tiffany.features.main.service.ProductService;
import com.tiffany.shared.dto.ApiResponse;
import com.tiffany.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/products")
@RequiredArgsConstructor
@Slf4j
public class PublicProductController {

    private final ProductService productService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductListDto>>> getAllPublicProducts(
            @Valid @RequestBody ProductFilterDto filter) {
        log.info("Getting products with pagination");
        PaginationResponse<ProductListDto> products = productService.getAllDataProductsWithPagination(filter);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailDto>> getPublicProductById(@PathVariable UUID id) {
        log.info("Getting product: id={}", id);
        ProductDetailDto product = productService.getProductByIdPublic(id);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }
}