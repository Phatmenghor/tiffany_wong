package com.tiffany.features.order.service.impl;

import com.tiffany.exception.custom.NotFoundException;
import com.tiffany.exception.custom.ValidationException;
import com.tiffany.features.auth.models.User;
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

import java.util.List;
import java.util.Optional;
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

        log.info("Submit cart item - User: {}, Product: {}, Quantity: {}",
                userId, request.getProductId(), request.getQuantity());

        // Get or create cart
        Cart cart = getOrCreateCart(userId);

        // Check if item already exists in cart (with pessimistic lock to prevent
        // OptimisticLockException when users rapidly update quantities)
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductIdAndSizeIdForUpdate(
                cart.getId(), request.getProductId(), request.getProductSizeId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();

            if (request.getQuantity() == 0) {
                cartItemRepository.delete(item);
                log.info("Removed cart item: {} for user: {}", item.getId(), userId);
            } else {
                item.setQuantity(request.getQuantity());
                cartItemRepository.save(item);
                log.info("Updated cart item quantity to: {} for user: {}", request.getQuantity(), userId);
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
                log.info("Added new item to cart with quantity: {} for user: {}", request.getQuantity(), userId);
            }
        }

        // Flush pending changes and clear the persistence context so the reload
        // query populates all lazy relations (product, productSize) from the database
        // instead of returning cached entities with null associations.
        entityManager.flush();
        entityManager.clear();

        // Reload cart with items for response (deduplication happens during load)
        return loadCartSummary(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public CartSummaryResponse getCart() {
        UUID userId = securityUtils.getCurrentUserId();
        log.info("Getting cart for user: {}", userId);

        return loadCartSummary(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public CartSummaryResponse getCartPaginated(int pageNo, int pageSize) {
        UUID userId = securityUtils.getCurrentUserId();
        log.info("Getting paginated cart for user: {}, page: {}, size: {}",
                userId, pageNo, pageSize);

        Optional<Cart> cartOpt = cartRepository.findByUserIdWithItems(userId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();

            // Deduplicate items first (handles race conditions)
            deduplicateCartItems(cart);

            // Filter unavailable items
            filterUnavailableItems(cart);

            // Store total item count BEFORE pagination (for response)
            int totalItemCount = cart.getItems() == null ? 0 : cart.getItems().size();

            // Apply pagination to items
            if (cart.getItems() != null && !cart.getItems().isEmpty()) {
                int start = (pageNo - 1) * pageSize;
                int end = Math.min(start + pageSize, cart.getItems().size());

                // Create a new list with only the paginated items
                List<CartItem> paginatedItems = cart.getItems().subList(start, end);
                cart.setItems(paginatedItems);
            }

            CartSummaryResponse response = cartMapper.toSummaryResponse(cart);
            // Override totalItems to be item count (for pagination), not sum of quantities
            response.setTotalItems(totalItemCount);
            return response;
        }
        return emptyCartSummary();
    }

    @Override
    public CartSummaryResponse clearCart() {
        UUID userId = securityUtils.getCurrentUserId();
        log.info("Clearing cart for user: {}", userId);

        Optional<Cart> cartOpt = cartRepository.findByUserIdWithItems(userId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            if (cart.getItems() != null && !cart.getItems().isEmpty()) {
                int count = cart.getItems().size();
                cartItemRepository.deleteAll(cart.getItems());
                cart.getItems().clear();
                log.info("Cleared {} items from cart: {}", count, cart.getId());
            }
        }

        return emptyCartSummary();
    }

    // ===== PRIVATE HELPER METHODS =====

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

        com.tiffany.features.order.dto.helper.CartCreateHelper helper =
            new com.tiffany.features.order.dto.helper.CartCreateHelper(userId);
        Cart newCart = cartMapper.createFromHelper(helper);
        Cart savedCart = cartRepository.save(newCart);

        log.info("Created new cart for user: {}", userId);
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
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            return;
        }

        // Keep track of (productId, productSizeId) pairs and their IDs
        java.util.Map<String, java.util.UUID> latestByKey = new java.util.LinkedHashMap<>();
        java.util.Map<String, java.time.LocalDateTime> latestTimeByKey = new java.util.LinkedHashMap<>();
        java.util.List<java.util.UUID> duplicateIds = new java.util.ArrayList<>();

        for (CartItem item : cart.getItems()) {
            String key = item.getProductId() + "|" + item.getProductSizeId();
            java.time.LocalDateTime itemTime = item.getCreatedAt();

            if (latestByKey.containsKey(key)) {
                // Check which one is newer
                java.time.LocalDateTime existingTime = latestTimeByKey.get(key);
                if (itemTime != null && existingTime != null && itemTime.isAfter(existingTime)) {
                    // Current item is newer, mark old one as duplicate
                    duplicateIds.add(latestByKey.get(key));
                    latestByKey.put(key, item.getId());
                    latestTimeByKey.put(key, itemTime);
                } else {
                    // Existing item is newer, mark current as duplicate
                    duplicateIds.add(item.getId());
                }
            } else {
                latestByKey.put(key, item.getId());
                latestTimeByKey.put(key, itemTime);
            }
        }

        // Remove duplicates from cart collection
        if (!duplicateIds.isEmpty()) {
            cart.getItems().removeIf(item -> duplicateIds.contains(item.getId()));
            log.warn("Removed {} duplicate cart items from collection", duplicateIds.size());
        }
    }

    private void filterUnavailableItems(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            return;
        }

        var unavailableItems = cart.getItems().stream()
                .filter(item -> !isCartItemAvailable(item))
                .toList();

        if (!unavailableItems.isEmpty()) {
            cartItemRepository.deleteAll(unavailableItems);
            log.info("Deleted {} unavailable cart items from cart: {}",
                    unavailableItems.size(), cart.getId());
        }

        cart.getItems().removeIf(item -> !isCartItemAvailable(item));
    }

    private boolean isCartItemAvailable(CartItem cartItem) {
        try {
            Product product = cartItem.getProduct();
            if (product == null) {
                Optional<Product> productOpt = productRepository.findByIdAndIsDeletedFalse(cartItem.getProductId());
                if (productOpt.isEmpty()) {
                    return false;
                }
                product = productOpt.get();
            }

            if (product.getIsDeleted() || !product.isActive()) {
                return false;
            }

            if (cartItem.getProductSizeId() != null) {
                ProductSize productSize = cartItem.getProductSize();
                if (productSize == null) {
                    Optional<ProductSize> sizeOpt = productSizeRepository.findById(cartItem.getProductSizeId());
                    if (sizeOpt.isEmpty()) {
                        return false;
                    }
                    productSize = sizeOpt.get();
                }
                return !productSize.getIsDeleted();
            }

            return true;
        } catch (Exception e) {
            log.error("Error checking cart item availability for item {}: {}", cartItem.getId(), e.getMessage());
            return false;
        }
    }
}
