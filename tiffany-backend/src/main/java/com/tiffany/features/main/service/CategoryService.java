package com.tiffany.features.main.service;

import com.tiffany.features.main.dto.filter.CategoryAllFilterRequest;
import com.tiffany.features.main.dto.filter.CategoryFilterRequest;
import com.tiffany.features.main.dto.request.CategoryCreateRequest;
import com.tiffany.features.main.dto.response.CategoryResponse;
import com.tiffany.features.main.dto.response.CategoryWithProductCountResponse;
import com.tiffany.features.main.dto.update.CategoryUpdateRequest;
import com.tiffany.shared.dto.PaginationResponse;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    // CRUD Operations
    CategoryWithProductCountResponse createCategory(CategoryCreateRequest request);
    PaginationResponse<CategoryResponse> getAllCategories(CategoryFilterRequest filter);
    PaginationResponse<CategoryWithProductCountResponse> getCategoriesWithProductCount(CategoryFilterRequest filter);
    List<CategoryResponse> getAllItemCategories(CategoryAllFilterRequest filter);
    CategoryWithProductCountResponse getCategoryById(UUID id);
    CategoryWithProductCountResponse updateCategory(UUID id, CategoryUpdateRequest request);
    CategoryWithProductCountResponse deleteCategory(UUID id);
}