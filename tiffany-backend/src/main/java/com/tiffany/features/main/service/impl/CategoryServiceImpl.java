package com.tiffany.features.main.service.impl;

import com.tiffany.exception.custom.NotFoundException;
import com.tiffany.exception.custom.ValidationException;
import com.tiffany.enums.product.ProductStatus;
import com.tiffany.features.main.dto.filter.CategoryAllFilterRequest;
import com.tiffany.features.main.dto.filter.CategoryFilterRequest;
import com.tiffany.features.main.dto.request.CategoryCreateRequest;
import com.tiffany.features.main.dto.response.CategoryResponse;
import com.tiffany.features.main.dto.response.CategoryWithProductCountResponse;
import com.tiffany.features.main.dto.update.CategoryUpdateRequest;
import com.tiffany.features.main.mapper.CategoryMapper;
import com.tiffany.features.main.models.Category;
import com.tiffany.features.main.repository.CategoryRepository;
import com.tiffany.features.main.repository.ProductRepository;
import com.tiffany.features.main.service.CategoryService;
import com.tiffany.enums.common.Status;
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
    private final ProductRepository productRepository;
    private final CategoryMapper categoryMapper;
    private final PaginationMapper paginationMapper;

    @Override
    public CategoryWithProductCountResponse createCategory(CategoryCreateRequest request) {
        log.info("Creating category: name={}", request.getName());

        if (categoryRepository.existsByNameAndIsDeletedFalse(request.getName())) {
            log.warn("Category name already exists: name={}", request.getName());
            throw new ValidationException("Category name already exists");
        }

        Category category = categoryMapper.toEntity(request);
        Category savedCategory = categoryRepository.save(category);

        log.info("Category created: id={}, name={}", savedCategory.getId(), savedCategory.getName());
        return buildCategoryWithProductCount(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<CategoryResponse> getAllCategories(CategoryFilterRequest filter) {
        log.info("Fetching categories: page={}, size={}, status={}, search={}",
                filter.getPageNo(), filter.getPageSize(), filter.getStatus(), filter.getSearch());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Category> categoryPage = categoryRepository.findAllWithFilters(
                filter.getStatus(),
                filter.getSearch(),
                pageable
        );

        log.info("Categories fetched: total={}, pages={}, current={}",
                categoryPage.getTotalElements(), categoryPage.getTotalPages(), categoryPage.getNumber() + 1);

        return categoryMapper.toPaginationResponse(categoryPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<CategoryWithProductCountResponse> getCategoriesWithProductCount(CategoryFilterRequest filter) {
        log.info("Fetching categories with product count: page={}, size={}, status={}, search={}",
                filter.getPageNo(), filter.getPageSize(), filter.getStatus(), filter.getSearch());

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

        Map<UUID, Long> totalProductCountMap = new HashMap<>();
        for (Object[] row : categoryRepository.countTotalProductsByCategories(categoryIds)) {
            totalProductCountMap.put((UUID) row[0], ((Number) row[1]).longValue());
        }

        Map<UUID, Long> activeProductCountMap = new HashMap<>();
        for (Object[] row : categoryRepository.countActiveProductsByCategories(categoryIds, ProductStatus.ACTIVE)) {
            activeProductCountMap.put((UUID) row[0], ((Number) row[1]).longValue());
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

        log.info("Categories with product count fetched: total={}, pages={}, current={}",
                categoryPage.getTotalElements(), categoryPage.getTotalPages(), categoryPage.getNumber() + 1);

        return paginationResponse;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllItemCategories(CategoryAllFilterRequest filter) {
        log.info("Fetching all categories (list): status={}, search={}", filter.getStatus(), filter.getSearch());

        List<Category> categories = categoryRepository.findAllWithFilters(
                filter.getStatus(),
                filter.getSearch(),
                PaginationUtils.createSort(filter.getSortBy(), filter.getSortDirection())
        );

        log.info("All categories fetched: count={}", categories.size());
        return categoryMapper.toResponseList(categories);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryWithProductCountResponse getCategoryById(UUID id) {
        log.info("Fetching category: id={}", id);
        Category category = findCategoryById(id);
        log.info("Category fetched: id={}, name={}", id, category.getName());
        return buildCategoryWithProductCount(category);
    }

    @Override
    public CategoryWithProductCountResponse updateCategory(UUID id, CategoryUpdateRequest request) {
        log.info("Updating category: id={}", id);

        Category category = findCategoryById(id);

        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (categoryRepository.existsByNameAndIsDeletedFalse(request.getName())) {
                log.warn("Category name already exists: name={}", request.getName());
                throw new ValidationException("Category name already exists");
            }
        }

        if (request.getStatus() != null && !request.getStatus().equals(category.getStatus())) {
            Status oldStatus = category.getStatus();
            Status newStatus = request.getStatus();
            ProductStatus productStatus = newStatus == Status.ACTIVE ? ProductStatus.ACTIVE : ProductStatus.INACTIVE;
            productRepository.updateProductsStatusByCategory(id, productStatus);
            log.info("Cascaded status change to products: categoryId={}, from={}, to={}", id, oldStatus, newStatus);
        }

        categoryMapper.updateEntity(request, category);
        Category updatedCategory = categoryRepository.save(category);

        log.info("Category updated: id={}, name={}", id, updatedCategory.getName());
        return buildCategoryWithProductCount(updatedCategory);
    }

    @Override
    public CategoryWithProductCountResponse deleteCategory(UUID id) {
        log.info("Deleting category: id={}", id);

        Category category = findCategoryById(id);
        category.softDelete();
        category = categoryRepository.save(category);

        log.info("Category deleted: id={}", id);
        return buildCategoryWithProductCount(category);
    }

    private Category findCategoryById(UUID id) {
        return categoryRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Category not found: id={}", id);
                    return new NotFoundException("Category not found");
                });
    }

    private CategoryWithProductCountResponse buildCategoryWithProductCount(Category category) {
        CategoryResponse baseResponse = categoryMapper.toResponse(category);

        List<UUID> ids = List.of(category.getId());

        long totalProducts = categoryRepository.countTotalProductsByCategories(ids)
                .stream().findFirst().map(r -> ((Number) r[1]).longValue()).orElse(0L);
        long activeProducts = categoryRepository.countActiveProductsByCategories(ids, ProductStatus.ACTIVE)
                .stream().findFirst().map(r -> ((Number) r[1]).longValue()).orElse(0L);

        CategoryWithProductCountResponse response = new CategoryWithProductCountResponse();
        response.setId(baseResponse.getId());
        response.setCreatedAt(baseResponse.getCreatedAt());
        response.setUpdatedAt(baseResponse.getUpdatedAt());
        response.setCreatedBy(baseResponse.getCreatedBy());
        response.setUpdatedBy(baseResponse.getUpdatedBy());
        response.setName(baseResponse.getName());
        response.setImageUrl(baseResponse.getImageUrl());
        response.setStatus(baseResponse.getStatus());
        response.setTotalProducts(totalProducts);
        response.setActiveProducts(activeProducts);

        return response;
    }
}
