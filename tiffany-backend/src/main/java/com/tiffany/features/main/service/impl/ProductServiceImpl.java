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
    public PaginationResponse<ProductListDto> getAllDataProductsWithPagination(ProductFilterDto filter) {
        log.info("Fetching public products: page={}, size={}, categoryId={}, hasPromotion={}, search={}",
                filter.getPageNo(), filter.getPageSize(), filter.getCategoryId(),
                filter.getHasPromotion(), filter.getSearch());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Product> productPage = productRepository.findAllWithFiltersOptimized(
                filter.getCategoryId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getHasPromotion(),
                filter.getHasSize(),
                filter.getSearch() != null ? filter.getSearch().trim() : null,
                pageable
        );

        if (productPage.getContent().isEmpty()) {
            log.info("No public products found: page={}, total=0", filter.getPageNo());
            return paginationMapper.toPaginationResponse(productPage, Collections.emptyList());
        }

        List<ProductListDto> dtoList = productMapper.toListDtos(productPage.getContent());

        Optional<User> currentUser = securityUtils.getCurrentUserOptional();
        if (currentUser.isPresent()) {
            List<UUID> productIds = productPage.getContent().stream().map(Product::getId).toList();
            List<UUID> favoriteIds = favoriteQueryHelper.getFavoriteProductIds(currentUser.get().getId(), productIds);
            Set<UUID> favoriteSet = new HashSet<>(favoriteIds);
            dtoList.forEach(dto -> dto.setIsFavorited(favoriteSet.contains(dto.getId())));
            log.info("Favorite flags applied: userId={}, favoriteCount={}", currentUser.get().getId(), favoriteIds.size());
        } else {
            dtoList.forEach(dto -> dto.setIsFavorited(false));
        }

        log.info("Public products fetched: total={}, pages={}, current={}",
                productPage.getTotalElements(), productPage.getTotalPages(), productPage.getNumber() + 1);

        return paginationMapper.toPaginationResponse(productPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductDetailDto> getAllProductsAdmin(ProductFilterDto filter) {
        log.info("Fetching products (admin): page={}, size={}, categoryId={}, statuses={}, search={}",
                filter.getPageNo(), filter.getPageSize(), filter.getCategoryId(),
                filter.getStatuses(), filter.getSearch());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Product> productPage = productRepository.findAllWithFiltersOptimized(
                filter.getCategoryId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getHasPromotion(),
                filter.getHasSize(),
                filter.getSearch() != null ? filter.getSearch().trim() : null,
                pageable
        );

        if (productPage.getContent().isEmpty()) {
            log.info("No products found (admin): page={}, total=0", filter.getPageNo());
            return paginationMapper.toPaginationResponse(productPage, Collections.emptyList());
        }

        productPage.getContent().forEach(p -> Hibernate.initialize(p.getSizes()));
        productPage.getContent().forEach(p -> p.setImages(new ArrayList<>()));

        List<ProductDetailDto> dtoList = productMapper.toDetailDtos(productPage.getContent());

        log.info("Products fetched (admin): total={}, pages={}, current={}",
                productPage.getTotalElements(), productPage.getTotalPages(), productPage.getNumber() + 1);

        return paginationMapper.toPaginationResponse(productPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailDto getProductById(UUID id) {
        log.info("Fetching product: id={}", id);

        Product product = productRepository.findByIdWithAllDetails(id)
                .orElseThrow(() -> {
                    log.warn("Product not found: id={}", id);
                    return new NotFoundException("Product not found");
                });

        ProductDetailDto dto = productMapper.toDetailDto(product);
        populateUserFieldsForDetail(dto, securityUtils.getCurrentUserOptional(), product);

        log.info("Product fetched: id={}, name={}", id, product.getName());
        return dto;
    }

    @Override
    @Transactional
    public ProductDetailDto getProductByIdPublic(UUID id) {
        log.info("Fetching product (public): id={}", id);

        Product product = productRepository.findByIdWithAllDetails(id)
                .orElseThrow(() -> {
                    log.warn("Product not found (public): id={}", id);
                    return new NotFoundException("Product not found");
                });

        productRepository.incrementViewCount(id);

        ProductDetailDto dto = productMapper.toDetailDto(product);
        populateUserFieldsForDetail(dto, securityUtils.getCurrentUserOptional(), product);

        log.info("Product fetched (public): id={}, name={}", id, product.getName());
        return dto;
    }

    @Override
    public ProductDetailDto createProduct(ProductCreateDto request) {
        log.info("Creating product: name={}, categoryId={}", request.getName(), request.getCategoryId());

        Product product = productMapper.toEntity(request);
        Product savedProduct = productRepository.save(product);

        handleProductImages(savedProduct, request.getImages());
        handleProductSizes(savedProduct, request.getSizes());

        log.info("Product created: id={}, name={}", savedProduct.getId(), savedProduct.getName());
        return getProductById(savedProduct.getId());
    }

    @Override
    public ProductDetailDto updateProduct(UUID id, ProductUpdateDto request) {
        log.info("Updating product: id={}", id);

        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Product not found for update: id={}", id);
                    return new NotFoundException("Product not found");
                });

        productMapper.updateEntity(request, product);
        productRepository.save(product);

        updateProductImages(product, request.getImages());
        updateProductSizes(product, request.getSizes());

        log.info("Product updated: id={}", id);
        return getProductById(id);
    }

    @Override
    public ProductDetailDto deleteProduct(UUID id) {
        log.info("Deleting product: id={}", id);

        Product product = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Product not found for delete: id={}", id);
                    return new NotFoundException("Product not found");
                });

        product.softDelete();
        Product deletedProduct = productRepository.save(product);

        log.info("Product deleted: id={}", id);
        return productMapper.toDetailDto(deletedProduct);
    }

    @Override
    @Transactional
    public ProductDetailDto resetProductPromotion(UUID id) {
        log.info("Resetting promotion for product: id={}", id);

        productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Product not found for promotion reset: id={}", id);
                    return new NotFoundException("Product not found");
                });

        productSizeRepository.resetPromotionsByProductId(id);
        productRepository.resetProductPromotionById(id);

        log.info("Product promotion reset: id={}", id);
        return getProductById(id);
    }

    @Override
    @Transactional
    public Map<String, Object> resetAllPromotions() {
        log.info("Resetting all promotions");

        int sizesReset = productSizeRepository.resetAllPromotionsForProductSizes();
        int productsWithoutSizes = productRepository.resetAllPromotionsForProductsWithoutSizes();
        int productsWithSizes = productRepository.resetAllPromotionsForProductsWithSizes();
        int totalProductsReset = productsWithoutSizes + productsWithSizes;

        log.info("All promotions reset: productsReset={}, sizesReset={}", totalProductsReset, sizesReset);

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
        log.info("Resetting selected promotions: productCount={}", request.getProductIds().size());

        if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
            log.warn("Reset selected promotions called with empty product list");
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

        log.info("Selected promotions reset: productsReset={}, sizesReset={}", productsReset, sizesReset);

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
        log.info("Creating bulk promotions: productCount={}, promotionType={}",
                request.getProductIds().size(), request.getPromotionType());

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
                log.warn("Bulk promotion failed for product: productId={}, error={}", product.getId(), e.getMessage());
                failedProductIds.add(product.getId());
            }
        }

        log.info("Bulk promotions created: success={}, failed={}", successCount, failedProductIds.size());

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
        log.info("Syncing expired promotions");
        int noSizes = productRepository.clearExpiredPromotionsForProductsWithoutSizes();
        int withSizes = productRepository.clearExpiredPromotionsForProductsWithSizes();
        log.info("Expired promotions synced: withoutSizes={}, withSizes={}, total={}", noSizes, withSizes, noSizes + withSizes);
        return new int[]{noSizes, withSizes};
    }

    @Override
    @Transactional
    public int[] syncStartedPromotions() {
        log.info("Syncing started promotions");
        int noSizes = productRepository.syncStartedPromotionsForProductsWithoutSizes();
        int withSizes = productRepository.syncStartedPromotionsForProductsWithSizes();
        log.info("Started promotions synced: withoutSizes={}, withSizes={}, total={}", noSizes, withSizes, noSizes + withSizes);
        return new int[]{noSizes, withSizes};
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
            log.info("Product images saved: productId={}, count={}", product.getId(), images.size());
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
        log.info("Product sizes saved: productId={}, count={}", product.getId(), sizes.size());
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
            log.info("Product images deleted: productId={}, count={}", product.getId(), idsToDelete.size());
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
            log.info("Product images added: productId={}, count={}", product.getId(), newImages.size());
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
            log.info("Product sizes deleted: productId={}, count={}", product.getId(), idsToDelete.size());
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
            log.info("Product sizes added: productId={}, count={}", product.getId(), newSizes.size());
            changed = true;
        }

        return changed;
    }
}
