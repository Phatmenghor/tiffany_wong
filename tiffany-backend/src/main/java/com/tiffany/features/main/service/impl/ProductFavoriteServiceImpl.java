package com.tiffany.features.main.service.impl;

import com.tiffany.exception.custom.NotFoundException;
import com.tiffany.exception.custom.ValidationException;
import com.tiffany.features.auth.models.User;
import com.tiffany.features.main.dto.filter.ProductFilterDto;
import com.tiffany.features.main.dto.response.FavoriteRemoveAllDto;
import com.tiffany.features.main.dto.response.FavoriteToggleDto;
import com.tiffany.features.main.dto.response.ProductListDto;
import com.tiffany.features.main.mapper.FavoriteMapper;
import com.tiffany.features.main.mapper.ProductMapper;
import com.tiffany.features.main.models.Product;
import com.tiffany.features.main.models.ProductFavorite;
import com.tiffany.features.main.repository.ProductFavoriteRepository;
import com.tiffany.features.main.repository.ProductRepository;
import com.tiffany.features.main.service.ProductFavoriteService;
import com.tiffany.features.order.utils.CartQueryHelper;
import com.tiffany.security.SecurityUtils;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.mapper.PaginationMapper;
import com.tiffany.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductFavoriteServiceImpl implements ProductFavoriteService {

    private final ProductRepository productRepository;
    private final ProductFavoriteRepository favoriteRepository;
    private final ProductMapper productMapper;
    private final FavoriteMapper favoriteMapper;
    private final PaginationMapper paginationMapper;
    private final SecurityUtils securityUtils;
    private final CartQueryHelper cartQueryHelper;

    @Override
    public FavoriteToggleDto toggleFavorite(UUID productId) {
        User currentUser = securityUtils.getCurrentUser();
        UUID userId = currentUser.getId();

        log.info("Toggling favorite - Product: {}, User: {}", productId, userId);

        Product product = productRepository.findByIdAndIsDeletedFalse(productId)
                .orElseThrow(() -> new NotFoundException("Product not found: " + productId));

        if (!product.isActive()) {
            throw new ValidationException("Cannot favorite inactive product");
        }

        boolean isFavorited = favoriteRepository.existsByUserIdAndProductIdAndIsDeletedFalse(userId, productId);

        String action;
        boolean finalStatus;

        if (!isFavorited) {
            ProductFavorite favorite = new ProductFavorite(userId, productId);
            favoriteRepository.save(favorite);
            productRepository.incrementFavoriteCount(productId);
            action = "added";
            finalStatus = true;
            log.info("Favorite added - Product: {}, User: {}", productId, userId);
        } else {
            favoriteRepository.deleteByUserIdAndProductId(userId, productId);
            productRepository.decrementFavoriteCount(productId);
            action = "removed";
            finalStatus = false;
            log.info("Favorite removed - Product: {}, User: {}", productId, userId);
        }

        return favoriteMapper.createToggleResponse(productId, userId, finalStatus, action);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductListDto> getUserFavorites(ProductFilterDto filter) {
        UUID userId = securityUtils.getCurrentUserId();
        log.info("Getting favorites - User: {}", userId);

        Pageable pageable = PaginationUtils.createPageable(
            filter.getPageNo(),
            filter.getPageSize(),
            "createdAt",
            "DESC"
        );

        Page<Product> favoritePage = productRepository.findUserFavorites(userId, pageable);

        PaginationResponse<ProductListDto> response = productMapper.toPaginationResponse(
            favoritePage,
            paginationMapper
        );

        if (!response.getContent().isEmpty()) {
            List<UUID> productIds = response.getContent().stream()
                    .map(ProductListDto::getId)
                    .toList();

            Map<UUID, Integer> cartQuantities = cartQueryHelper.getProductQuantitiesInCart(
                    userId, null, productIds
            );

            response.getContent().forEach(product -> {
                product.setIsFavorited(true);
                product.setQuantity(cartQuantities.getOrDefault(product.getId(), 0));
            });
        }

        log.info("Retrieved {} favorites - User: {}", response.getContent().size(), userId);
        return response;
    }

    @Override
    public FavoriteRemoveAllDto removeAllFavorites(UUID businessId) {
        UUID userId = securityUtils.getCurrentUserId();
        log.info("Removing all favorites - User: {}, Business: {}", userId, businessId);

        int removedCount = favoriteRepository.deleteAllByUserIdAndBusinessId(userId, businessId);

        log.info("Removed {} favorites - User: {}, Business: {}", removedCount, userId, businessId);

        return FavoriteRemoveAllDto.builder()
                .userId(userId)
                .removedCount(removedCount)
                .timestamp(LocalDateTime.now())
                .message(String.format("Removed %d products from favorites", removedCount))
                .build();
    }
}
