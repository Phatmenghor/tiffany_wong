package com.tiffany.features.order.service.impl;

import com.tiffany.exception.custom.ValidationException;
import com.tiffany.features.auth.models.User;
import com.tiffany.features.order.dto.helper.CartCreateHelper;
import com.tiffany.features.order.dto.request.CartItemCreateRequest;
import com.tiffany.features.order.dto.response.CartSummaryResponse;
import com.tiffany.features.order.mapper.CartMapper;
import com.tiffany.features.order.models.Cart;
import com.tiffany.features.order.models.CartItem;
import com.tiffany.features.order.repository.CartItemRepository;
import com.tiffany.features.order.repository.CartRepository;
import com.tiffany.features.order.service.CartService;
import com.tiffany.features.main.models.Product;
import com.tiffany.features.main.models.ProductSize;
import com.tiffany.features.main.repository.ProductRepository;
import com.tiffany.features.main.repository.ProductSizeRepository;
import com.tiffany.security.SecurityUtils;
import com.tiffany.shared.retry.RetryOnOptimisticLock;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductSizeRepository productSizeRepository;
    private final CartMapper cartMapper;
    private final SecurityUtils securityUtils;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @RetryOnOptimisticLock
    public CartSummaryResponse submitCartItem(CartItemCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        UUID userId = currentUser.getId();
        log.info("Submit cart item: userId={}, productId={}, sizeId={}, quantity={}",
                userId, request.getProductId(), request.getProductSizeId(), request.getQuantity());

        Cart cart = getOrCreateCart(userId);

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductIdAndSizeIdForUpdate(
                cart.getId(), request.getProductId(), request.getProductSizeId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();

            if (request.getQuantity() == 0) {
                cartItemRepository.delete(item);
                log.info("Cart item removed: userId={}, cartItemId={}", userId, item.getId());
            } else {
                item.setQuantity(request.getQuantity());
                cartItemRepository.save(item);
                log.info("Cart item quantity updated: userId={}, cartItemId={}, quantity={}",
                        userId, item.getId(), request.getQuantity());
            }
        } else {
            if (request.getQuantity() > 0) {
                CartItem newItem = new CartItem(
                        cart.getId(),
                        request.getProductId(),
                        request.getProductSizeId(),
                        request.getQuantity()
                );
                cartItemRepository.save(newItem);
                log.info("Cart item added: userId={}, productId={}, sizeId={}, quantity={}",
                        userId, request.getProductId(), request.getProductSizeId(), request.getQuantity());
            } else {
                log.info("Ignored zero-quantity add for non-existing cart item: userId={}, productId={}",
                        userId, request.getProductId());
            }
        }

        entityManager.flush();
        entityManager.clear();

        CartSummaryResponse response = loadCartSummary(userId);
        log.info("Cart updated: userId={}, totalItems={}", userId, response.getTotalItems());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public CartSummaryResponse getCart() {
        UUID userId = securityUtils.getCurrentUserId();
        log.info("Fetching cart: userId={}", userId);

        CartSummaryResponse response = loadCartSummary(userId);
        log.info("Cart fetched: userId={}, totalItems={}", userId, response.getTotalItems());
        return response;
    }

    @Override
    public CartSummaryResponse clearCart() {
        UUID userId = securityUtils.getCurrentUserId();
        log.info("Clearing cart: userId={}", userId);

        Optional<Cart> cartOpt = cartRepository.findByUserIdWithItems(userId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            if (cart.getItems() != null && !cart.getItems().isEmpty()) {
                int count = cart.getItems().size();
                cartItemRepository.deleteAll(cart.getItems());
                cart.getItems().clear();
                log.info("Cart cleared: userId={}, removedItems={}", userId, count);
            } else {
                log.info("Cart already empty: userId={}", userId);
            }
        } else {
            log.info("No cart found to clear: userId={}", userId);
        }

        return emptyCartSummary();
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private CartSummaryResponse loadCartSummary(UUID userId) {
        Optional<Cart> cartOpt = cartRepository.findByUserIdWithItems(userId);
        if (cartOpt.isPresent()) {
            Cart loaded = cartOpt.get();
            deduplicateCartItems(loaded);
            filterUnavailableItems(loaded);
            return cartMapper.toSummaryResponse(loaded);
        }
        return emptyCartSummary();
    }

    private CartSummaryResponse emptyCartSummary() {
        CartSummaryResponse empty = new CartSummaryResponse();
        empty.setTotalItems(0);
        return empty;
    }

    private Cart getOrCreateCart(UUID userId) {
        Optional<Cart> existingCart = cartRepository.findByUserIdAndIsDeletedFalse(userId);
        if (existingCart.isPresent()) {
            return existingCart.get();
        }

        CartCreateHelper helper = new CartCreateHelper(userId);
        Cart newCart = cartMapper.createFromHelper(helper);
        Cart savedCart = cartRepository.save(newCart);
        log.info("Cart created: userId={}, cartId={}", userId, savedCart.getId());
        return savedCart;
    }

    private void validateProductAvailability(Product product) {
        if (product == null) {
            throw new ValidationException("Product not found");
        }
        if (product.getIsDeleted()) {
            throw new ValidationException("Product has been removed");
        }
        if (!product.isActive()) {
            throw new ValidationException("Product is no longer available");
        }
    }

    private void deduplicateCartItems(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) return;

        Map<String, UUID> latestByKey = new LinkedHashMap<>();
        Map<String, LocalDateTime> latestTimeByKey = new LinkedHashMap<>();
        List<UUID> duplicateIds = new ArrayList<>();

        for (CartItem item : cart.getItems()) {
            String key = item.getProductId() + "|" + item.getProductSizeId();
            LocalDateTime itemTime = item.getCreatedAt();

            if (latestByKey.containsKey(key)) {
                LocalDateTime existingTime = latestTimeByKey.get(key);
                if (itemTime != null && existingTime != null && itemTime.isAfter(existingTime)) {
                    duplicateIds.add(latestByKey.get(key));
                    latestByKey.put(key, item.getId());
                    latestTimeByKey.put(key, itemTime);
                } else {
                    duplicateIds.add(item.getId());
                }
            } else {
                latestByKey.put(key, item.getId());
                latestTimeByKey.put(key, itemTime);
            }
        }

        if (!duplicateIds.isEmpty()) {
            cart.getItems().removeIf(item -> duplicateIds.contains(item.getId()));
            log.warn("Duplicate cart items removed: cartId={}, count={}", cart.getId(), duplicateIds.size());
        }
    }

    private void filterUnavailableItems(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) return;

        var unavailableItems = cart.getItems().stream()
                .filter(item -> !isCartItemAvailable(item))
                .toList();

        if (!unavailableItems.isEmpty()) {
            cartItemRepository.deleteAll(unavailableItems);
            log.info("Unavailable cart items removed: cartId={}, count={}", cart.getId(), unavailableItems.size());
        }

        cart.getItems().removeIf(item -> !isCartItemAvailable(item));
    }

    private boolean isCartItemAvailable(CartItem cartItem) {
        try {
            Product product = cartItem.getProduct();
            if (product == null) {
                Optional<Product> productOpt = productRepository.findByIdAndIsDeletedFalse(cartItem.getProductId());
                if (productOpt.isEmpty()) return false;
                product = productOpt.get();
            }

            if (product.getIsDeleted() || !product.isActive()) return false;

            if (cartItem.getProductSizeId() != null) {
                ProductSize productSize = cartItem.getProductSize();
                if (productSize == null) {
                    Optional<ProductSize> sizeOpt = productSizeRepository.findById(cartItem.getProductSizeId());
                    if (sizeOpt.isEmpty()) return false;
                    productSize = sizeOpt.get();
                }
                return !productSize.getIsDeleted();
            }

            return true;
        } catch (Exception e) {
            log.error("Cart item availability check failed: cartItemId={}, error={}", cartItem.getId(), e.getMessage());
            return false;
        }
    }
}
