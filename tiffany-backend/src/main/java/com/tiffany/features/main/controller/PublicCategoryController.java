package com.tiffany.features.main.controller;

import com.tiffany.features.main.dto.filter.CategoryAllFilterRequest;
import com.tiffany.features.main.dto.filter.CategoryFilterRequest;
import com.tiffany.features.main.dto.response.CategoryResponse;
import com.tiffany.features.main.service.CategoryService;
import com.tiffany.shared.dto.ApiResponse;
import com.tiffany.shared.dto.PaginationResponse;
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
@RequestMapping("/api/v1/public/categories")
@RequiredArgsConstructor
@Slf4j
public class PublicCategoryController {
    private final CategoryService categoryService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<CategoryResponse>>> getAllCategories(@Valid @RequestBody CategoryFilterRequest filter) {
        log.info("Getting categories");
        PaginationResponse<CategoryResponse> categories = categoryService.getAllCategories(filter);
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    @PostMapping("/all-data")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllDataCategories(@Valid @RequestBody CategoryAllFilterRequest filter) {
        log.info("Getting all categories");
        List<CategoryResponse> categories = categoryService.getAllItemCategories(filter);
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }
}
