package com.tiffany.features.main.service.impl;

import com.tiffany.exception.custom.NotFoundException;
import com.tiffany.exception.custom.ValidationException;
import com.tiffany.features.auth.models.User;
import com.tiffany.features.main.dto.filter.ProductFilterDto;
import com.tiffany.features.main.dto.request.ProductCreateDto;
import com.tiffany.features.main.dto.request.ProductImageCreateDto;
import com.tiffany.features.main.dto.request.ProductSizeCreateDto;
import com.tiffany.features.main.dto.request.BulkPromotionCreateDto;
import com.tiffany.features.main.dto.request.ResetSelectedPromotionsDto;
import com.tiffany.features.main.dto.response.ProductDetailDto;
import com.tiffany.features.main.dto.response.ProductListDto;
import com.tiffany.features.main.dto.response.BulkPromotionResultDto;
import com.tiffany.features.main.dto.update.ProductImageUpdateDto;
import com.tiffany.features.main.dto.update.ProductSizeUpdateDto;
import com.tiffany.features.main.dto.update.ProductUpdateDto;
import com.tiffany.features.main.mapper.ProductImageMapper;
import com.tiffany.features.main.mapper.ProductMapper;
import com.tiffany.features.main.mapper.ProductSizeMapper;
import com.tiffany.features.main.models.Product;
import com.tiffany.features.main.models.ProductImage;
import com.tiffany.features.main.models.ProductSize;
import com.tiffany.features.main.repository.ProductImageRepository;
import com.tiffany.features.main.repository.ProductRepository;
import com.tiffany.features.main.repository.ProductSizeRepository;
import com.tiffany.features.main.service.ProductService;
import com.tiffany.features.main.utils.ProductFavoriteQueryHelper;
import com.tiffany.features.main.utils.ProductUtils;
import com.tiffany.security.SecurityUtils;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.mapper.PaginationMapper;
import com.tiffany.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductSizeRepository productSizeRepository;
    private final ProductMapper productMapper;
    private final ProductImageMapper productImageMapper;
    private final ProductSizeMapper productSizeMapper;
    private final PaginationMapper paginationMapper;
    private final SecurityUtils securityUtils;
    private final ProductUtils productUtils;
    private final ProductFavoriteQueryHelper favoriteQueryHelper;

    @Override
    @Transactional(readOnly = true)
    public List<ProductListDto> getAllDataProducts(ProductFilterDto filter) {
        List<Product> products = productRepository.findAllWithFilters(
                filter.getCategoryId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getHasPromotion(),
                filter.getSearch(),
                PaginationUtils.createSort(filter.getSortBy(), filter.getSortDirection())
        );

        List<ProductListDto> dtoList = productMapper.toListDtos(products);

        if (products.isEmpty()) {
            return dtoList;
        }

        Optional<User> currentUser = securityUtils.getCurrentUserOptional();
        if (currentUser.isPresent()) {
            List<UUID> productIds = products.stream().map(Product::getId).toList();
            List<UUID> favoriteIds = favoriteQueryHelper.getFavoriteProductIds(currentUser.get().getId(), productIds);
            Set<UUID> favoriteSet = new HashSet<>(favoriteIds);

            dtoList.forEach(dto -> {
                dto.setIsFavorited(favoriteSet.contains(dto.getId()));
            });
        } else {
            dtoList.forEach(dto -> {
                dto.setIsFavorited(false);
            });
        }

        return dtoList;
    }


    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductDetailDto> getAllProductsAdmin(ProductFilterDto filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(),
                filter.getPageSize(),
                filter.getSortBy(),
                filter.getSortDirection()
        );

        Page<Product> productPage = productRepository.findAllWithFiltersOptimized(
                filter.getCategoryId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getHasPromotion(),
                filter.getSearch(),
                pageable
        );

        if (productPage.getContent().isEmpty()) {
            return paginationMapper.toPaginationResponse(productPage, Collections.emptyList());
        }

        productPage.getContent().forEach(p -> Hibernate.initialize(p.getSizes()));
        productPage.getContent().forEach(p -> p.setImages(new ArrayList<>()));

        List<ProductDetailDto> dtoList = productMapper.toDetailDtos(productPage.getContent());
        return paginationMapper.toPaginationResponse(productPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailDto getProductById(UUID id) {
        Product product = productRepository.findByIdWithAllDetails(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        ProductDetailDto dto = productMapper.toDetailDto(product);
        populateUserFieldsForDetail(dto, securityUtils.getCurrentUserOptional(), product);

        return dto;
    }

    @Override
    @Transactional
    public ProductDetailDto getProductByIdPublic(UUID id) {
        Product product = productRepository.findByIdWithAllDetails(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        productRepository.incrementViewCount(id);

        ProductDetailDto dto = productMapper.toDetailDto(product);
        populateUserFieldsForDetail(dto, securityUtils.getCurrentUserOptional(), product);

        return dto;
    }

    private void populateUserFieldsForDetail(ProductDetailDto dto, Optional<User> currentUser, Product product) {
        if (currentUser.isPresent()) {
            UUID userId = currentUser.get().getId();

            boolean isFavorited = favoriteQueryHelper.isFavorited(userId, product.getId());
            dto.setIsFavorited(isFavorited);
        } else {
            dto.setIsFavorited(false);
        }
    }

    @Override
    @Transactional
    public ProductDetailDto resetProductPromotion(UUID id) {
        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        productSizeRepository.resetPromotionsByProductId(id);
        productRepository.resetProductPromotionById(id);

        log.info("Product promotion reset: id={}", id);
        return getProductById(id);
    }

    @Override
    @Transactional
    public Map<String, Object> resetAllPromotions() {
        int sizesReset = productSizeRepository.resetAllPromotionsForProductSizes();
        int productsWithoutSizes = productRepository.resetAllPromotionsForProductsWithoutSizes();
        int productsWithSizes = productRepository.resetAllPromotionsForProductsWithSizes();
        int totalProductsReset = productsWithoutSizes + productsWithSizes;

        log.info("Reset all promotions: products={}, sizes={}", totalProductsReset, sizesReset);

        Map<String, Object> response = new HashMap<>();
        response.put("message", String.format("Successfully reset promotions for %d products and %d sizes",
                totalProductsReset, sizesReset));
        response.put("resetCount", totalProductsReset + sizesReset);
        response.put("productsReset", totalProductsReset);
        response.put("sizesReset", sizesReset);
        return response;
    }

    @Override
    @Transactional
    public Map<String, Object> resetSelectedPromotions(ResetSelectedPromotionsDto request) {
        if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
            throw new ValidationException("No products selected");
        }

        int sizesReset = 0;
        int productsReset;

        Map<UUID, List<UUID>> sizeMapping = request.getProductSizeMapping();
        if (sizeMapping != null && !sizeMapping.isEmpty()) {
            for (Map.Entry<UUID, List<UUID>> entry : sizeMapping.entrySet()) {
                List<UUID> sizeIds = entry.getValue();
                if (!sizeIds.isEmpty()) {
                    List<ProductSize> sizes = productSizeRepository.findAllById(sizeIds);
                    for (ProductSize size : sizes) {
                        if (size.getProductId().equals(entry.getKey())) {
                            size.removePromotion();
                            sizesReset++;
                        }
                    }
                    productSizeRepository.saveAll(sizes);
                }
            }
        } else {
            sizesReset = productSizeRepository.resetPromotionsBulkForProductSizes(request.getProductIds());
        }

        productsReset = productRepository.resetPromotionsBulk(request.getProductIds());

        log.info("Reset selected promotions: products={}, sizes={}", productsReset, sizesReset);

        Map<String, Object> response = new HashMap<>();
        response.put("message", String.format("Successfully reset promotions for %d products and %d sizes",
                productsReset, sizesReset));
        response.put("resetCount", productsReset + sizesReset);
        response.put("productsReset", productsReset);
        response.put("sizesReset", sizesReset);
        return response;
    }

    @Override
    @Transactional
    public BulkPromotionResultDto createBulkPromotions(BulkPromotionCreateDto request) {
        List<UUID> failedProductIds = new ArrayList<>();
        int successCount = 0;

        List<Product> products = productRepository.findAllById(request.getProductIds());

        for (Product product : products) {
            try {
                product.setPromotionType(request.getPromotionType());
                product.setPromotionValue(request.getPromotionValue());
                product.setPromotionFromDate(request.getPromotionFromDate());
                product.setPromotionToDate(request.getPromotionToDate());

                List<ProductSize> sizes = productSizeRepository.findByProductId(product.getId());
                if (!sizes.isEmpty()) {
                    List<UUID> specifiedSizeIds = null;
                    if (request.getProductSizeMapping() != null &&
                            request.getProductSizeMapping().containsKey(product.getId())) {
                        specifiedSizeIds = request.getProductSizeMapping().get(product.getId());
                    }

                    for (ProductSize size : sizes) {
                        if (!size.getIsDeleted()) {
                            boolean shouldApply = specifiedSizeIds == null ||
                                    specifiedSizeIds.contains(size.getId());

                            if (shouldApply) {
                                size.setPromotionType(request.getPromotionType());
                                size.setPromotionValue(request.getPromotionValue());
                                size.setPromotionFromDate(request.getPromotionFromDate());
                                size.setPromotionToDate(request.getPromotionToDate());
                            } else {
                                size.setPromotionType(null);
                                size.setPromotionValue(null);
                                size.setPromotionFromDate(null);
                                size.setPromotionToDate(null);
                            }
                        }
                    }
                    productSizeRepository.saveAll(sizes);
                }

                productRepository.save(product);
                successCount++;
            } catch (Exception e) {
                log.warn("Failed to apply bulk promotion: productId={}", product.getId());
                failedProductIds.add(product.getId());
            }
        }

        log.info("Bulk promotion created: success={}, failed={}", successCount, failedProductIds.size());

        return BulkPromotionResultDto.builder()
                .successCount(successCount)
                .failedCount(failedProductIds.size())
                .failedProductIds(failedProductIds)
                .message(String.format("Successfully created promotion for %d product(s)", successCount))
                .timestamp(java.time.LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public int[] syncExpiredPromotions() {
        int noSizes = productRepository.clearExpiredPromotionsForProductsWithoutSizes();
        int withSizes = productRepository.clearExpiredPromotionsForProductsWithSizes();
        return new int[]{noSizes, withSizes};
    }

    @Override
    @Transactional
    public int[] syncStartedPromotions() {
        int noSizes = productRepository.syncStartedPromotionsForProductsWithoutSizes();
        int withSizes = productRepository.syncStartedPromotionsForProductsWithSizes();
        return new int[]{noSizes, withSizes};
    }

    @Override
    public ProductDetailDto createProduct(ProductCreateDto request) {
        log.info("Creating product: name={}", request.getName());

        Product product = productMapper.toEntity(request);
        Product savedProduct = productRepository.save(product);

        handleProductImages(savedProduct, request.getImages());
        handleProductSizes(savedProduct, request.getSizes());

        log.info("Product created: id={}", savedProduct.getId());
        return getProductById(savedProduct.getId());
    }

    @Override
    public ProductDetailDto updateProduct(UUID id, ProductUpdateDto request) {
        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        productMapper.updateEntity(request, product);
        productRepository.save(product);

        updateProductImages(product, request.getImages());
        updateProductSizes(product, request.getSizes());

        log.info("Product updated: id={}", id);

        // Fetch fresh product data after all updates to avoid Hibernate orphan removal conflicts
        return getProductById(id);
    }

    @Override
    public ProductDetailDto deleteProduct(UUID id) {
        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        product.softDelete();
        Product deletedProduct = productRepository.save(product);

        log.info("Product deleted: id={}", id);
        return productMapper.toDetailDto(deletedProduct);
    }

    private void handleProductImages(Product product, List<ProductImageCreateDto> imageDtos) {
        if (imageDtos == null || imageDtos.isEmpty()) return;

        List<ProductImage> images = imageDtos.stream()
                .filter(imageDto -> productUtils.isValidImageUrl(imageDto.getImageUrl()))
                .map(imageDto -> {
                    ProductImage image = productImageMapper.toEntity(imageDto);
                    image.setProductId(product.getId());
                    return image;
                })
                .toList();

        if (!images.isEmpty()) {
            productImageRepository.saveAll(images);
        }
    }

    private void handleProductSizes(Product product, List<ProductSizeCreateDto> sizeDtos) {
        if (sizeDtos == null || sizeDtos.isEmpty()) return;

        List<ProductSize> sizes = sizeDtos.stream()
                .map(sizeDto -> {
                    ProductSize size = productSizeMapper.toEntity(sizeDto);
                    size.setProductId(product.getId());
                    return size;
                })
                .toList();

        productSizeRepository.saveAll(sizes);
    }

    private void updateProductImages(Product product, List<ProductImageUpdateDto> imageDtos) {
        if (imageDtos == null || imageDtos.isEmpty()) return;

        List<ProductImage> existingImages = productImageRepository.findByProductId(product.getId());

        List<UUID> idsToDelete = productImageMapper.getIdsToDelete(imageDtos);
        if (!idsToDelete.isEmpty()) {
            existingImages.stream()
                    .filter(img -> idsToDelete.contains(img.getId()))
                    .forEach(img -> {
                        img.softDelete();
                        productImageRepository.save(img);
                    });
        }

        List<ProductImageUpdateDto> toUpdate = productImageMapper.getExistingToUpdate(imageDtos);
        for (ProductImageUpdateDto updateDto : toUpdate) {
            existingImages.stream()
                    .filter(img -> img.getId().equals(updateDto.getId()))
                    .findFirst()
                    .ifPresent(existingImage -> {
                        productImageMapper.updateEntity(updateDto, existingImage);
                        productImageRepository.save(existingImage);
                    });
        }

        List<ProductImage> newImages = productImageMapper.toEntitiesFromUpdate(imageDtos);
        newImages.forEach(img -> img.setProductId(product.getId()));
        if (!newImages.isEmpty()) {
            productImageRepository.saveAll(newImages);
        }
    }

    private boolean updateProductSizes(Product product, List<ProductSizeUpdateDto> sizeDtos) {
        if (sizeDtos == null || sizeDtos.isEmpty()) return false;

        boolean changed = false;
        List<ProductSize> existingSizes = productSizeRepository.findByProductId(product.getId());

        List<UUID> idsToDelete = productSizeMapper.getIdsToDelete(sizeDtos);
        if (!idsToDelete.isEmpty()) {
            existingSizes.stream()
                    .filter(size -> idsToDelete.contains(size.getId()))
                    .forEach(size -> {
                        size.softDelete();
                        productSizeRepository.save(size);
                    });
            changed = true;
        }

        List<ProductSizeUpdateDto> toUpdate = productSizeMapper.getExistingToUpdate(sizeDtos);
        if (!toUpdate.isEmpty()) {
            for (ProductSizeUpdateDto updateDto : toUpdate) {
                existingSizes.stream()
                        .filter(size -> size.getId().equals(updateDto.getId()))
                        .findFirst()
                        .ifPresent(existingSize -> {
                            productSizeMapper.updateEntity(updateDto, existingSize);
                            productSizeRepository.save(existingSize);
                        });
            }
            changed = true;
        }

        List<ProductSize> newSizes = productSizeMapper.toEntitiesFromUpdate(sizeDtos);
        if (!newSizes.isEmpty()) {
            newSizes.forEach(size -> size.setProductId(product.getId()));
            productSizeRepository.saveAll(newSizes);
            changed = true;
        }

        return changed;
    }


}