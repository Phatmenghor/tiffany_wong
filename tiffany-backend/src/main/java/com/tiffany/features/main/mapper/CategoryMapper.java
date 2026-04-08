package com.tiffany.features.main.mapper;

import com.tiffany.features.main.dto.request.CategoryCreateRequest;
import com.tiffany.features.main.dto.response.CategoryResponse;
import com.tiffany.features.main.dto.update.CategoryUpdateRequest;
import com.tiffany.features.main.models.Category;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.mapper.PaginationMapper;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PaginationMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryMapper {

    Category toEntity(CategoryCreateRequest request);

    CategoryResponse toResponse(Category category);

    List<CategoryResponse> toResponseList(List<Category> categories);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(CategoryUpdateRequest request, @MappingTarget Category category);

    default PaginationResponse<CategoryResponse> toPaginationResponse(Page<Category> categoryPage, PaginationMapper paginationMapper) {
return paginationMapper.toPaginationResponse(categoryPage, this::toResponseList);
    }
}