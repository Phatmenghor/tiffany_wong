package com.tiffany.features.main.controller;

import com.tiffany.features.main.dto.filter.CategoryFilterRequest;
import com.tiffany.features.main.dto.request.CategoryCreateRequest;
import com.tiffany.features.main.dto.response.CategoryResponse;
import com.tiffany.features.main.dto.response.CategoryWithProductCountResponse;
import com.tiffany.features.main.dto.update.CategoryUpdateRequest;
import com.tiffany.features.main.service.CategoryService;
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
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        log.info("Creating category: {}", request.getName());
        CategoryResponse category = categoryService.createCategory(request);
        log.info("Category created: id={}", category.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", category));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<CategoryResponse>>> getAllCategories(@Valid @RequestBody CategoryFilterRequest filter) {
        log.info("Getting categories");
        PaginationResponse<CategoryResponse> categories = categoryService.getAllCategories(filter);
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    @PostMapping("/product/all")
    public ResponseEntity<ApiResponse<PaginationResponse<CategoryWithProductCountResponse>>> getCategoriesWithProductCount(@Valid @RequestBody CategoryFilterRequest filter) {
        log.info("Getting categories with product count");
        PaginationResponse<CategoryWithProductCountResponse> categories = categoryService.getCategoriesWithProductCount(filter);
        return ResponseEntity.ok(ApiResponse.success("Categories with product count retrieved successfully", categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable UUID id) {
        log.info("Getting category: id={}", id);
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        log.info("Updating category: id={}", id);
        CategoryResponse category = categoryService.updateCategory(id, request);
        log.info("Category updated: id={}", category.getId());
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> deleteCategory(@PathVariable UUID id) {
        log.info("Deleting category: id={}", id);
        CategoryResponse category = categoryService.deleteCategory(id);
        log.info("Category deleted: id={}", category.getId());
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", category));
    }
}