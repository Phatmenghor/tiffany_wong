package com.tiffany.features.main.service.impl;

import com.tiffany.exception.custom.NotFoundException;
import com.tiffany.exception.custom.ValidationException;
import com.tiffany.features.main.dto.filter.CategoryAllFilterRequest;
import com.tiffany.features.main.dto.filter.CategoryFilterRequest;
import com.tiffany.features.main.dto.request.CategoryCreateRequest;
import com.tiffany.features.main.dto.response.CategoryResponse;
import com.tiffany.features.main.dto.response.CategoryWithProductCountResponse;
import com.tiffany.features.main.dto.update.CategoryUpdateRequest;
import com.tiffany.features.main.mapper.CategoryMapper;
import com.tiffany.features.main.models.Category;
import com.tiffany.features.main.repository.CategoryRepository;
import com.tiffany.features.main.service.CategoryService;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.mapper.PaginationMapper;
import com.tiffany.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final PaginationMapper paginationMapper;

    @Override
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        if (categoryRepository.existsByNameAndIsDeletedFalse(request.getName())) {
            throw new ValidationException("Category name already exists");
        }

        Category category = categoryMapper.toEntity(request);
        Category savedCategory = categoryRepository.save(category);

        log.info("Category created: name={}", savedCategory.getName());
        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<CategoryResponse> getAllCategories(CategoryFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Category> categoryPage = categoryRepository.findAllWithFilters(
                filter.getStatus(),
                filter.getSearch(),
                pageable
        );
        return categoryMapper.toPaginationResponse(categoryPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<CategoryWithProductCountResponse> getCategoriesWithProductCount(CategoryFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Category> categoryPage = categoryRepository.findAllWithFilters(
                filter.getStatus(),
                filter.getSearch(),
                pageable
        );

        List<UUID> categoryIds = categoryPage.getContent().stream()
                .map(Category::getId)
                .toList();

        List<Object[]> productCountData = categoryRepository.countTotalAndActiveProductsForCategories(categoryIds);

        Map<UUID, Long> totalProductCountMap = new HashMap<>();
        Map<UUID, Long> activeProductCountMap = new HashMap<>();
        for (Object[] data : productCountData) {
            UUID categoryId = (UUID) data[0];
            Long totalCount = ((Number) data[1]).longValue();
            Long activeCount = ((Number) data[2]).longValue();
            totalProductCountMap.put(categoryId, totalCount);
            activeProductCountMap.put(categoryId, activeCount);
        }

        List<CategoryWithProductCountResponse> responses = categoryPage.getContent().stream()
                .map(category -> {
                    CategoryWithProductCountResponse response = new CategoryWithProductCountResponse();
                    CategoryResponse baseResponse = categoryMapper.toResponse(category);

                    response.setId(baseResponse.getId());
                    response.setCreatedAt(baseResponse.getCreatedAt());
                    response.setUpdatedAt(baseResponse.getUpdatedAt());
                    response.setCreatedBy(baseResponse.getCreatedBy());
                    response.setUpdatedBy(baseResponse.getUpdatedBy());
                    response.setName(baseResponse.getName());
                    response.setImageUrl(baseResponse.getImageUrl());
                    response.setStatus(baseResponse.getStatus());

                    long totalProductCount = totalProductCountMap.getOrDefault(category.getId(), 0L);
                    long activeProductCount = activeProductCountMap.getOrDefault(category.getId(), 0L);
                    response.setTotalProducts(totalProductCount);
                    response.setActiveProducts(activeProductCount);

                    return response;
                })
                .toList();

        PaginationResponse<CategoryWithProductCountResponse> paginationResponse = new PaginationResponse<>();
        paginationResponse.setContent(responses);
        paginationResponse.setPageNo(categoryPage.getNumber() + 1);
        paginationResponse.setPageSize(categoryPage.getSize());
        paginationResponse.setTotalElements(categoryPage.getTotalElements());
        paginationResponse.setTotalPages(categoryPage.getTotalPages());
        paginationResponse.setFirst(categoryPage.isFirst());
        paginationResponse.setLast(categoryPage.isLast());
        paginationResponse.setHasNext(categoryPage.hasNext());
        paginationResponse.setHasPrevious(categoryPage.hasPrevious());

        return paginationResponse;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllItemCategories(CategoryAllFilterRequest filter) {
        List<Category> categories = categoryRepository.findAllWithFilters(
                filter.getStatus(),
                filter.getSearch(),
                PaginationUtils.createSort(filter.getSortBy(), filter.getSortDirection())
        );
        return categoryMapper.toResponseList(categories);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(UUID id) {
        Category category = findCategoryById(id);
        return categoryMapper.toResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(UUID id, CategoryUpdateRequest request) {
        Category category = findCategoryById(id);

        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (categoryRepository.existsByNameAndIsDeletedFalse(request.getName())) {
                throw new ValidationException("Category name already exists");
            }
        }

        categoryMapper.updateEntity(request, category);
        Category updatedCategory = categoryRepository.save(category);

        log.info("Category updated: id={}", id);
        return categoryMapper.toResponse(updatedCategory);
    }

    @Override
    public CategoryResponse deleteCategory(UUID id) {
        Category category = findCategoryById(id);

        category.softDelete();
        category = categoryRepository.save(category);

        log.info("Category deleted: id={}", id);
        return categoryMapper.toResponse(category);
    }

    private Category findCategoryById(UUID id) {
        return categoryRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));
    }
}