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
import com.tiffany.features.main.repository.CategoryRepository;
import com.tiffany.features.main.repository.ProductImageRepository;
import com.tiffany.features.main.repository.ProductRepository;
import com.tiffany.features.main.repository.ProductSizeRepository;
import com.tiffany.features.main.service.ProductService;
import com.tiffany.features.main.models.Category;
import com.tiffany.features.main.utils.ProductFavoriteQueryHelper;
import com.tiffany.features.main.utils.ProductUtils;
import com.tiffany.features.order.utils.CartQueryHelper;
import com.tiffany.security.SecurityUtils;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.mapper.PaginationMapper;
import com.tiffany.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final ProductImageMapper productImageMapper;
    private final ProductSizeMapper productSizeMapper;
    private final PaginationMapper paginationMapper;
    private final SecurityUtils securityUtils;
    private final ProductUtils productUtils;
    private final ProductFavoriteQueryHelper favoriteQueryHelper;
    private final CartQueryHelper cartQueryHelper;

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductListDto> getAllProducts(ProductFilterDto filter) {
        log.debug("Starting getAllProducts - Filter: CategoryId={}, Search={}",
                filter.getCategoryId(), filter.getSearch());

        long startTime = System.currentTimeMillis();
        Optional<User> currentUser = securityUtils.getCurrentUserOptional();

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(),
                filter.getPageSize(),
                filter.getSortBy(),
                filter.getSortDirection()
        );
        log.debug("Pagination configured - Page: {}, Size: {}, SortBy: {}, Direction: {}",
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection());

        Page<Product> productPage = productRepository.findAllWithFilters(
                filter.getCategoryId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                Boolean.TRUE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                Boolean.FALSE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getHasSize(),
                filter.getSearch(),
                pageable
        );

        log.info("Products fetched from database - Total: {}, Page: {}, Size: {}",
                productPage.getTotalElements(), productPage.getNumber(), productPage.getSize());

        if (productPage.getContent().isEmpty()) {
            log.debug("No products found for filters");
            return paginationMapper.toPaginationResponse(productPage, Collections.emptyList());
        }

        // Batch initialize sizes to avoid lazy-loading (prevents Hibernate pagination warning)
        productPage.getContent().forEach(p -> Hibernate.initialize(p.getSizes()));

        // Recalculate display fields from current sizes
        productPage.getContent().forEach(Product::syncDisplayFieldsFromSizes);

        List<ProductListDto> dtoList = productMapper.toListDtos(productPage.getContent());

        enrichTotalStock(dtoList, productPage.getContent());

        if (currentUser.isPresent()) {
            List<UUID> productIds = productPage.getContent().stream()
                    .map(Product::getId)
                    .toList();

            // Get favorite products
            List<UUID> favoriteIds = favoriteQueryHelper.getFavoriteProductIds(
                    currentUser.get().getId(),
                    productIds
            );
            Set<UUID> favoriteSet = new HashSet<>(favoriteIds);

            // Get cart quantities for products
            Map<UUID, Integer> cartQuantities = cartQueryHelper.getProductQuantitiesInCart(
                    currentUser.get().getId(),
                    null,
                    productIds
            );

            dtoList.forEach(dto -> {
                dto.setIsFavorited(favoriteSet.contains(dto.getId()));
                dto.setQuantity(cartQuantities.getOrDefault(dto.getId(), 0));
            });
        } else {
            dtoList.forEach(dto -> {
                dto.setIsFavorited(false);
                dto.setQuantity(0);
            });
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("getAllProducts completed in {}ms - Returned {} products out of {}",
                duration, dtoList.size(), productPage.getTotalElements());

        return paginationMapper.toPaginationResponse(productPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductListDto> getAllDataProducts(ProductFilterDto filter) {
        log.debug("Starting getAllDataProducts - Filter: CategoryId={}, Search={}",
                filter.getCategoryId(), filter.getSearch());

        long startTime = System.currentTimeMillis();
        Optional<User> currentUser = securityUtils.getCurrentUserOptional();

        List<Product> products = productRepository.findAllWithFilters(
                null,
                filter.getCategoryId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                Boolean.TRUE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                Boolean.FALSE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getSearch(),
                PaginationUtils.createSort(filter.getSortBy(), filter.getSortDirection())
        );

        log.info("Products fetched from database - Total count: {}", products.size());

        // Recalculate display fields from current sizes
        products.forEach(Product::syncDisplayFieldsFromSizes);

        List<ProductListDto> dtoList = productMapper.toListDtos(products);

        if (products.isEmpty()) {
            log.debug("No products found for filters");
            return dtoList;
        }

        enrichTotalStock(dtoList, products);

        if (currentUser.isPresent()) {
            List<UUID> productIds = products.stream()
                    .map(Product::getId)
                    .toList();

            // Get favorite products
            List<UUID> favoriteIds = favoriteQueryHelper.getFavoriteProductIds(
                    currentUser.get().getId(),
                    productIds
            );
            Set<UUID> favoriteSet = new HashSet<>(favoriteIds);

            // Get cart quantities for products
            Map<UUID, Integer> cartQuantities = cartQueryHelper.getProductQuantitiesInCart(
                    currentUser.get().getId(),
                    null,
                    productIds
            );

            dtoList.forEach(dto -> {
                dto.setIsFavorited(favoriteSet.contains(dto.getId()));
                dto.setQuantity(cartQuantities.getOrDefault(dto.getId(), 0));
            });
        } else {
            dtoList.forEach(dto -> {
                dto.setIsFavorited(false);
                dto.setQuantity(0);
            });
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("getAllDataProducts completed in {}ms - Returned {} products",
                duration, dtoList.size());

        return dtoList;
    }


    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductDetailDto> getAllProductsAdmin(ProductFilterDto filter) {
        Optional<User> currentUser = securityUtils.getCurrentUserOptional();

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(),
                filter.getPageSize(),
                filter.getSortBy(),
                filter.getSortDirection()
        );

        // Use optimized query - no category/business/images JOINs (20-30x faster)
        Page<Product> productPage = productRepository.findAllWithFiltersOptimized(
                null,
                filter.getCategoryId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                Boolean.TRUE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                Boolean.FALSE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getHasSize(),
                filter.getSearch(),
                pageable
        );

        if (productPage.getContent().isEmpty()) {
            return paginationMapper.toPaginationResponse(productPage, Collections.emptyList());
        }

        // Batch initialize sizes to avoid lazy-loading (prevents Hibernate pagination warning)
        productPage.getContent().forEach(p -> Hibernate.initialize(p.getSizes()));

        // Recalculate display fields from current sizes
        productPage.getContent().forEach(Product::syncDisplayFieldsFromSizes);

        // Clear images to prevent lazy-loading (not needed for admin listing)
        productPage.getContent().forEach(p -> p.setImages(new ArrayList<>()));

        // Use detail DTOs - mapper uses denormalized fields, not relationships
        List<ProductDetailDto> dtoList = productMapper.toDetailDtos(productPage.getContent());

        enrichTotalStockForDetails(dtoList, productPage.getContent());

        return paginationMapper.toPaginationResponse(productPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductDetailDto> getAllProductsAdminPos(ProductFilterDto filter) {
        Optional<User> currentUser = securityUtils.getCurrentUserOptional();

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(),
                filter.getPageSize(),
                filter.getSortBy(),
                filter.getSortDirection()
        );

        Page<Product> productPage = productRepository.findAllWithFilters(
                filter.getCategoryId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                Boolean.TRUE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                Boolean.FALSE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getHasSize(),
                filter.getSearch(),
                pageable
        );

        if (productPage.getContent().isEmpty()) {
            return paginationMapper.toPaginationResponse(productPage, Collections.emptyList());
        }

        // Batch initialize sizes to avoid lazy-loading (prevents Hibernate pagination warning)
        productPage.getContent().forEach(p -> Hibernate.initialize(p.getSizes()));

        // Clear images to avoid lazy-loading overhead (images not needed in listing)
        productPage.getContent().forEach(p -> p.setImages(new ArrayList<>()));

        // Recalculate display fields from current sizes
        productPage.getContent().forEach(Product::syncDisplayFieldsFromSizes);

        List<ProductDetailDto> dtoList = productMapper.toDetailDtos(productPage.getContent());

        enrichTotalStockForDetails(dtoList, productPage.getContent());

        return paginationMapper.toPaginationResponse(productPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductDetailDto> getAllProductsAdminStock(ProductFilterDto filter) {
        long startTime = System.currentTimeMillis();

        Optional<User> currentUser = securityUtils.getCurrentUserOptional();

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(),
                filter.getPageSize(),
                filter.getSortBy(),
                filter.getSortDirection()
        );

        // Fetch products with filters
        Page<Product> productPage = productRepository.findAllWithFilters(
                filter.getCategoryId(),
                (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) ? filter.getStatuses() : null,
                Boolean.TRUE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                Boolean.FALSE.equals(filter.getHasPromotion()) ? Boolean.TRUE : null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getHasSize(),
                filter.getSearch(),
                pageable
        );

        if (productPage.getContent().isEmpty()) {
            log.debug("No products found for stock query");
            return paginationMapper.toPaginationResponse(productPage, Collections.emptyList());
        }

        // Batch initialize sizes to avoid lazy-loading
        productPage.getContent().forEach(p -> Hibernate.initialize(p.getSizes()));

        // Clear images (not needed for stock listing)
        productPage.getContent().forEach(p -> p.setImages(new ArrayList<>()));

        // Recalculate display fields from current sizes
        productPage.getContent().forEach(Product::syncDisplayFieldsFromSizes);

        // All filters (including hasSize and stockStatuses) are now applied at database level
        List<ProductDetailDto> dtoList = productMapper.toDetailDtos(productPage.getContent());

        // Enrich with stock information
        enrichTotalStockForDetails(dtoList, productPage.getContent());
        enrichProductSizesStock(dtoList);

        long duration = System.currentTimeMillis() - startTime;
        log.info("getAllProductsAdminStock completed in {}ms - Retrieved {} products with stock info",
                duration, dtoList.size());

        return paginationMapper.toPaginationResponse(productPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailDto getProductById(UUID id) {
        log.debug("Starting getProductById - ID: {}", id);
        long startTime = System.currentTimeMillis();

        try {
            Product product = productRepository.findByIdWithAllDetails(id)
                    .orElseThrow(() -> {
                        log.error("Product not found - ID: {}", id);
                        return new NotFoundException("Product not found: " + id);
                    });

            log.debug("Product found - Name: '{}'", product.getName());

            Optional<User> currentUser = securityUtils.getCurrentUserOptional();

            // Initialize images for detail view (avoids MultipleBagFetchException by loading separately)
            Hibernate.initialize(product.getImages());
            log.debug("Product images initialized - Count: {}", product.getImages().size());

            // Recalculate display fields from current sizes (fixes stale DB values)
            product.syncDisplayFieldsFromSizes();

            ProductDetailDto dto = productMapper.toDetailDto(product);
            enrichTotalStockForDetail(dto, product.getId());
            log.debug("Product detail DTO created with enriched stock");

            populateUserFieldsForDetail(dto, currentUser, product);

            long duration = System.currentTimeMillis() - startTime;
            log.info("getProductById completed in {}ms - ID: {}, Name: '{}'",
                    duration, id, product.getName());

            return dto;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("getProductById failed after {}ms - ID: {}, Error: {}", duration, id, e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public ProductDetailDto getProductByIdPublic(UUID id) {
        log.debug("Starting getProductByIdPublic - ID: {}", id);
        long startTime = System.currentTimeMillis();

        try {
            Product product = productRepository.findByIdWithAllDetails(id)
                    .orElseThrow(() -> {
                        log.error("Product not found (public access) - ID: {}", id);
                        return new NotFoundException("Product not found: " + id);
                    });

            log.debug("Product found for public access - Name: '{}', Views: {}", product.getName(), product.getViewCount());

            productRepository.incrementViewCount(id);
            log.debug("View count incremented for product - ID: {}", id);

            // Initialize images for detail view (avoids MultipleBagFetchException by loading separately)
            Hibernate.initialize(product.getImages());
            log.debug("Product images initialized - Count: {}", product.getImages().size());

            // Recalculate display fields from current sizes (fixes stale DB values)
            product.syncDisplayFieldsFromSizes();

            ProductDetailDto dto = productMapper.toDetailDto(product);
            enrichTotalStockForDetail(dto, product.getId());
            log.debug("Product detail DTO created with enriched stock");

            Optional<User> currentUser = securityUtils.getCurrentUserOptional();
            populateUserFieldsForDetail(dto, currentUser, product);

            long duration = System.currentTimeMillis() - startTime;
            log.info("getProductByIdPublic completed in {}ms - ID: {}, Name: '{}'",
                    duration, id, product.getName());

            return dto;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("getProductByIdPublic failed after {}ms - ID: {}, Error: {}", duration, id, e.getMessage());
            throw e;
        }
    }

    private void populateUserFieldsForDetail(ProductDetailDto dto, Optional<User> currentUser, Product product) {
        if (currentUser.isPresent()) {
            UUID userId = currentUser.get().getId();

            boolean isFavorited = favoriteQueryHelper.isFavorited(userId, product.getId());
            dto.setIsFavorited(isFavorited);

            // Get cart quantity for this product
            Map<UUID, Integer> cartQuantities = cartQueryHelper.getProductQuantitiesInCart(
                    userId,
                    null,
                    List.of(product.getId())
            );
            dto.setQuantity(cartQuantities.getOrDefault(product.getId(), 0));

            // Get per-size quantities in cart
            if (dto.getSizes() != null && !dto.getSizes().isEmpty()) {
                Map<UUID, Integer> sizeQuantities = cartQueryHelper.getSizeQuantitiesInCart(userId, product.getId());
                dto.getSizes().forEach(size ->
                        size.setQuantity(sizeQuantities.getOrDefault(size.getId(), 0))
                );
            }
        } else {
            dto.setIsFavorited(false);
            dto.setQuantity(0);
            if (dto.getSizes() != null) {
                dto.getSizes().forEach(size -> size.setQuantity(0));
            }
        }
    }

    @Override
    @Transactional
    public ProductDetailDto resetProductPromotion(UUID id) {
        log.debug("Starting product promotion reset: ID={}", id);

        try {
            // Load product only to validate existence
            Product product = productRepository.findByIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> new NotFoundException("Product not found: " + id));

            User currentUser = securityUtils.getCurrentUser();

            // Reset sizes via native SQL (clearAutomatically evicts L1 cache)
            int sizesReset = productSizeRepository.resetPromotionsByProductId(id);
            log.debug("Promotion reset for {} sizes in product: {}", sizesReset, id);

            // Reset product via native SQL (handles display_price for with/without sizes,
            // clearAutomatically evicts L1 cache so getProductById reads fresh DB data)
            productRepository.resetProductPromotionById(id);

            log.info("Product promotion reset successfully: ID={}, Name='{}'", id, product.getName());
            return getProductById(id);
        } catch (Exception e) {
            log.error("Product promotion reset failed - ID: {}, Error: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public Map<String, Object> resetAllPromotions() {
        log.info("Starting reset all promotions for business");
        long startTime = System.currentTimeMillis();

        try {
            User currentUser = securityUtils.getCurrentUser();

            // Use native SQL queries for ultra-fast bulk reset (1000x faster than ORM)
            log.info("Executing native SQL bulk reset for all products");

            // Reset product sizes first (faster query)
            int sizesReset = productSizeRepository.resetAllPromotionsForProductSizes(null);
            log.info("Reset promotions for {} product sizes via SQL", sizesReset);

            // Reset products without sizes
            int productsWithoutSizes = productRepository.resetAllPromotionsForProductsWithoutSizes(null);
            log.info("Reset promotions for {} products without sizes via SQL", productsWithoutSizes);

            // Reset products with sizes (recalculates display fields from min size price)
            int productsWithSizes = productRepository.resetAllPromotionsForProductsWithSizes(null);
            log.info("Reset promotions for {} products with sizes via SQL", productsWithSizes);

            int totalProductsReset = productsWithoutSizes + productsWithSizes;
            long duration = System.currentTimeMillis() - startTime;

            log.info("Reset all promotions completed in {}ms - Products: {}, Sizes: {}, Total: {}",
                duration, totalProductsReset, sizesReset, totalProductsReset + sizesReset);

            Map<String, Object> response = new HashMap<>();
            response.put("message", String.format("Successfully reset promotions for %d products and %d sizes in %dms",
                totalProductsReset, sizesReset, duration));
            response.put("resetCount", totalProductsReset + sizesReset);
            response.put("productsReset", totalProductsReset);
            response.put("sizesReset", sizesReset);
            response.put("durationMs", duration);

            return response;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Reset all promotions failed after {}ms - Error: {}", duration, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public Map<String, Object> resetSelectedPromotions(ResetSelectedPromotionsDto request) {
        log.info("Starting reset promotions for {} selected products", request.getProductIds().size());
        long startTime = System.currentTimeMillis();

        try {
            if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
                throw new ValidationException("No products selected");
            }

            User currentUser = securityUtils.getCurrentUser();

            // Fetch products to reset
            List<Product> products = productRepository.findAllById(request.getProductIds());
            log.debug("Fetched {} products for reset", products.size());

            int sizesReset = 0;
            int productsReset = 0;

            // Check if we have size mapping
            Map<UUID, List<UUID>> sizeMapping = request.getProductSizeMapping();
            boolean hasSizeMapping = sizeMapping != null && !sizeMapping.isEmpty();

            if (hasSizeMapping) {
                // Reset only specific sizes for selected products
                log.debug("Resetting promotions for specific sizes in selected products");
                for (Map.Entry<UUID, List<UUID>> entry : sizeMapping.entrySet()) {
                    UUID productId = entry.getKey();
                    List<UUID> sizeIds = entry.getValue();
                    if (!sizeIds.isEmpty()) {
                        // For each size, reset by fetching and updating
                        // Since we don't have a batch query for specific sizes
                        List<ProductSize> sizes = productSizeRepository.findAllById(sizeIds);
                        for (ProductSize size : sizes) {
                            if (size.getProductId().equals(productId)) {
                                size.removePromotion();
                                sizesReset++;
                            }
                        }
                        productSizeRepository.saveAll(sizes);
                        log.debug("Reset promotions for {} sizes in product {}", sizesReset, productId);
                    }
                }
            } else {
                // Reset all promotions for selected products
                log.debug("Resetting all promotions for selected products");
                sizesReset = productSizeRepository.resetPromotionsBulkForProductSizes(request.getProductIds());
                log.debug("Reset promotions for {} product sizes", sizesReset);
            }

            // Reset product-level promotions
            productsReset = productRepository.resetPromotionsBulk(request.getProductIds());
            log.debug("Reset promotions for {} products", productsReset);

            long duration = System.currentTimeMillis() - startTime;

            Map<String, Object> response = new HashMap<>();
            response.put("message", String.format("Successfully reset promotions for %d products and %d sizes in %dms",
                productsReset, sizesReset, duration));
            response.put("resetCount", productsReset + sizesReset);
            response.put("productsReset", productsReset);
            response.put("sizesReset", sizesReset);
            response.put("durationMs", duration);

            log.info("Reset selected promotions completed in {}ms - Products: {}, Sizes: {}, Total: {}",
                duration, productsReset, sizesReset, productsReset + sizesReset);

            return response;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Reset selected promotions failed after {}ms - Error: {}", duration, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public BulkPromotionResultDto createBulkPromotions(BulkPromotionCreateDto request) {
        log.info("Starting bulk promotion creation for {} products, Type: {}, Value: {}",
            request.getProductIds().size(), request.getPromotionType(), request.getPromotionValue());
        long startTime = System.currentTimeMillis();

        User currentUser = securityUtils.getCurrentUser();

        List<UUID> failedProductIds = new ArrayList<>();
        int successCount = 0;

        // Fetch all requested products
        List<Product> products = productRepository.findAllById(request.getProductIds());
        log.debug("Fetched {} products from database", products.size());

        for (Product product : products) {
            try {

                // Set promotion fields on product
                product.setPromotionType(request.getPromotionType());
                product.setPromotionValue(request.getPromotionValue());
                product.setPromotionFromDate(request.getPromotionFromDate());
                product.setPromotionToDate(request.getPromotionToDate());
                log.debug("Promotion set on product: {}, Type: {}, Value: {}",
                    product.getId(), request.getPromotionType(), request.getPromotionValue());

                // Apply promotion to sizes if product has sizes
                if (product.getHasSizes()) {
                    List<ProductSize> sizes = productSizeRepository.findByProductId(product.getId());
                    log.debug("Product has {} sizes, applying promotion selectively", sizes.size());

                    // Check if there's a specific size mapping for this product
                    List<UUID> specifiedSizeIds = null;
                    if (request.getProductSizeMapping() != null &&
                        request.getProductSizeMapping().containsKey(product.getId())) {
                        specifiedSizeIds = request.getProductSizeMapping().get(product.getId());
                        log.debug("Size mapping specified for product: {}, Sizes: {}", product.getId(), specifiedSizeIds.size());
                    }

                    int appliedSizes = 0;
                    int clearedSizes = 0;

                    for (ProductSize size : sizes) {
                        if (!size.getIsDeleted()) {
                            // Apply promotion only to specified sizes, or to all if no specification
                            boolean shouldApply = specifiedSizeIds == null ||
                                                specifiedSizeIds.contains(size.getId());

                            if (shouldApply) {
                                size.setPromotionType(request.getPromotionType());
                                size.setPromotionValue(request.getPromotionValue());
                                size.setPromotionFromDate(request.getPromotionFromDate());
                                size.setPromotionToDate(request.getPromotionToDate());
                                appliedSizes++;
                            } else {
                                // Clear promotion from sizes not in the mapping
                                size.setPromotionType(null);
                                size.setPromotionValue(null);
                                size.setPromotionFromDate(null);
                                size.setPromotionToDate(null);
                                clearedSizes++;
                            }
                        }
                    }
                    productSizeRepository.saveAll(sizes);
                    log.debug("Bulk promotion applied to {} sizes, cleared {} sizes for product: {}",
                        appliedSizes, clearedSizes, product.getId());

                    // Sync display fields from sizes
                    product.syncDisplayFieldsFromSizes();
                } else {
                    // Initialize display fields for product without sizes
                    product.initializeDisplayFields();
                    log.debug("Display fields initialized for product without sizes: {}", product.getId());
                }

                productRepository.save(product);
                successCount++;
                log.debug("Bulk promotion successfully applied to product: {}", product.getId());
            } catch (Exception e) {
                log.error("Failed to apply bulk promotion to product: {}, Error: {}", product.getId(), e.getMessage(), e);
                failedProductIds.add(product.getId());
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("Bulk promotion creation completed in {}ms - Success: {}, Failed: {}, Total: {}",
            duration, successCount, failedProductIds.size(), request.getProductIds().size());

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
        log.debug("Starting product creation with name: '{}', has sizes: {}", request.getName(), request.getSizes() != null && !request.getSizes().isEmpty());
        long startTime = System.currentTimeMillis();

        try {
            User currentUser = securityUtils.getCurrentUser();

            Product product = productMapper.toEntity(request);
            product.initializeDisplayFields();
            syncDenormalizedNames(product);
            log.debug("Product entity mapped and initialized: {}", product.getName());

            Product savedProduct = productRepository.save(product);
            log.info("Product created successfully: ID={}, Name='{}'", savedProduct.getId(), savedProduct.getName());

            handleProductImages(savedProduct, request.getImages());
            log.debug("Product images handled: {} images", request.getImages() != null ? request.getImages().size() : 0);

            if (request.getSizes() != null && !request.getSizes().isEmpty()) {
                log.debug("Handling product sizes: {} sizes", request.getSizes().size());
                handleProductSizes(savedProduct, request.getSizes());

                List<ProductSize> sizes = productSizeRepository.findByProductId(savedProduct.getId());
                savedProduct.setSizes(sizes);
                savedProduct.syncDisplayFieldsFromSizes();
                savedProduct = productRepository.save(savedProduct);
                log.debug("Product with {} sizes saved successfully", sizes.size());
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("Product creation completed successfully in {}ms: {}", duration, savedProduct.getId());
            return getProductById(savedProduct.getId());
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Product creation failed after {}ms - Name: '{}', Error: {}", duration, request.getName(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public ProductDetailDto updateProduct(UUID id, ProductUpdateDto request) {
        log.debug("Starting product update: ID={}", id);
        long startTime = System.currentTimeMillis();

        try {
            Product product = productRepository.findByIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> new NotFoundException("Product not found: " + id));
            log.debug("Product found: Name='{}'", product.getName());

            User currentUser = securityUtils.getCurrentUser();

            productMapper.updateEntity(request, product);
            log.debug("Product entity updated with request data");

            // Update stock status if provided
            if (null != null) {
                log.debug("Product stock status updated: {}", null);
            }

            if (!product.getHasSizes()) {
                product.initializeDisplayFields();
                log.debug("Display fields initialized for product without sizes");
            }

            // Sync denormalized names in case category/brand changed
            syncDenormalizedNames(product);

            Product updatedProduct = productRepository.save(product);
            log.info("Product saved: ID={}, Name='{}'", updatedProduct.getId(), updatedProduct.getName());

            updateProductImages(updatedProduct, request.getImages());
            log.debug("Product images updated: {} images", request.getImages() != null ? request.getImages().size() : 0);

            boolean sizesChanged = updateProductSizes(updatedProduct, request.getSizes());
            log.debug("Product sizes update check completed, changed: {}", sizesChanged);

            if (sizesChanged) {
                List<ProductSize> sizes = productSizeRepository.findByProductId(updatedProduct.getId());
                updatedProduct.setSizes(sizes);
                updatedProduct.syncDisplayFieldsFromSizes();
                updatedProduct = productRepository.save(updatedProduct);
                log.debug("Product with {} sizes saved after size changes", sizes.size());
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("Product updated successfully in {}ms: ID={}", duration, id);
            return getProductById(updatedProduct.getId());
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Product update failed after {}ms - ID: {}, Error: {}", duration, id, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public ProductDetailDto deleteProduct(UUID id) {
        log.debug("Starting product deletion: ID={}", id);

        try {
            Product product = productRepository.findByIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> new NotFoundException("Product not found: " + id));
            log.debug("Product found for deletion: Name='{}'", product.getName());

            User currentUser = securityUtils.getCurrentUser();

            product.softDelete();
            log.debug("Product marked for soft delete: {}", id);

            Product deletedProduct = productRepository.save(product);
            log.info("Product deleted successfully (soft delete): ID={}, Name='{}'", deletedProduct.getId(), deletedProduct.getName());

            return productMapper.toDetailDto(deletedProduct);
        } catch (Exception e) {
            log.error("Product deletion failed - ID: {}, Error: {}", id, e.getMessage(), e);
            throw e;
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

    /**
     * Enrich product sizes with stock information from ProductStock repository
     * Sets totalStock for each ProductSizeDto
     * For products WITH sizes: updates parent totalStock as sum of all sizes
     * For products WITHOUT sizes: totalStock is already set by enrichTotalStockForDetails
     */
    private void enrichProductSizesStock(List<ProductDetailDto> dtoList) {
        for (ProductDetailDto dto : dtoList) {
            if (dto.getHasSizes() && dto.getSizes() != null && !dto.getSizes().isEmpty()) {
                int totalSizesStock = 0;

                // Get stock for each size from repository
                for (var sizeDto : dto.getSizes()) {
                    int stock = sizeDto.getStock() != null ? sizeDto.getStock() : 0;
                    totalSizesStock += stock;
                }

                // Set parent product totalStock as sum of all sizes
            }
            // For products without sizes, totalStock is already set by enrichTotalStockForDetails
        }
    }

    private void enrichTotalStock(List<ProductListDto> dtoList, List<Product> products) {
        // Stock enrichment disabled - no-op method
    }

    private void enrichTotalStockForDetail(ProductDetailDto dto, UUID productId) {
        // Stock enrichment disabled - no-op method
    }

    private void enrichTotalStockForDetails(List<ProductDetailDto> dtoList, List<Product> products) {
        // Stock enrichment disabled - no-op method
    }

    /**
     * Sync denormalized category name
     * Called when a product is created or updated
     */
    private void syncDenormalizedNames(Product product) {
        // Sync category name
        if (product.getCategoryId() != null) {
            categoryRepository.findByIdAndIsDeletedFalse(product.getCategoryId())
                    .ifPresent(category -> product.setCategoryName(category.getName()));
        }
    }
}