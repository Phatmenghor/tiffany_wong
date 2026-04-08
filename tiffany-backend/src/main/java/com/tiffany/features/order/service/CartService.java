package com.tiffany.features.order.service;

import com.tiffany.features.order.dto.request.CartItemCreateRequest;
import com.tiffany.features.order.dto.response.CartSummaryResponse;

import java.util.UUID;

public interface CartService {

    /**
     * POST - Submit cart item (add/update/remove)
     * Quantity 0 = remove, quantity >= 1 = set quantity
     */
    CartSummaryResponse submitCartItem(CartItemCreateRequest request);

    /**
     * GET - Get current user's cart
     */
    CartSummaryResponse getCart();

    /**
     * DELETE - Clear current user's cart
     */
    CartSummaryResponse clearCart();
}
