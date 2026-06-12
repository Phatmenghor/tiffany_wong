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

    @Override
    public FavoriteToggleDto toggleFavorite(UUID productId) {
        User currentUser = securityUtils.getCurrentUser();
        UUID userId = currentUser.getId();
        log.info("Toggle favorite: userId={}, productId={}", userId, productId);

        Product product = productRepository.findByIdAndIsDeletedFalse(productId)
                .orElseThrow(() -> {
                    log.warn("Product not found for favorite toggle: productId={}", productId);
                    return new NotFoundException("Product not found");
                });

        if (!product.isActive()) {
            log.warn("Cannot favorite inactive product: productId={}", productId);
            throw new ValidationException("Cannot favorite inactive product");
        }

        boolean isFavorited = favoriteRepository.existsByUserIdAndProductIdAndIsDeletedFalse(userId, productId);

        if (!isFavorited) {
            favoriteRepository.save(new ProductFavorite(userId, productId));
            productRepository.incrementFavoriteCount(productId);
            log.info("Favorite added: userId={}, productId={}", userId, productId);
            return favoriteMapper.createToggleResponse(productId, userId, true, "added");
        } else {
            favoriteRepository.deleteByUserIdAndProductId(userId, productId);
            productRepository.decrementFavoriteCount(productId);
            log.info("Favorite removed: userId={}, productId={}", userId, productId);
            return favoriteMapper.createToggleResponse(productId, userId, false, "removed");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ProductListDto> getUserFavorites(ProductFilterDto filter) {
        UUID userId = securityUtils.getCurrentUserId();
        log.info("Fetching user favorites: userId={}, page={}, size={}", userId, filter.getPageNo(), filter.getPageSize());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(),
                filter.getPageSize(),
                "createdAt",
                "DESC"
        );

        Page<Product> favoritePage = productRepository.findUserFavorites(userId, pageable);
        PaginationResponse<ProductListDto> response = productMapper.toPaginationResponse(favoritePage, paginationMapper);

        if (!response.getContent().isEmpty()) {
            response.getContent().forEach(product -> product.setIsFavorited(true));
        }

        log.info("User favorites fetched: userId={}, count={}, total={}",
                userId, response.getContent().size(), response.getTotalElements());

        return response;
    }

    @Override
    public FavoriteRemoveAllDto removeAllFavorites() {
        UUID userId = securityUtils.getCurrentUserId();
        log.info("Removing all favorites: userId={}", userId);

        int removedCount = favoriteRepository.deleteAllByUserId(userId);

        log.info("All favorites removed: userId={}, removedCount={}", userId, removedCount);

        return FavoriteRemoveAllDto.builder()
                .userId(userId)
                .removedCount(removedCount)
                .timestamp(LocalDateTime.now())
                .message(String.format("Removed %d products from favorites", removedCount))
                .build();
    }
}
