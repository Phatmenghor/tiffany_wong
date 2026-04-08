package com.tiffany.features.order.controller;

import com.tiffany.features.order.dto.request.CartItemCreateRequest;
import com.tiffany.features.order.dto.response.CartSummaryResponse;
import com.tiffany.features.order.service.CartService;
import com.tiffany.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<ApiResponse<CartSummaryResponse>> submitCartItem(@Valid @RequestBody CartItemCreateRequest request) {
        log.info("Submit cart item - product: {}, qty: {} (0=remove, >0=add/update)", request.getProductId(), request.getQuantity());
        CartSummaryResponse cart = cartService.submitCartItem(request);
        return ResponseEntity.ok(ApiResponse.success("Cart updated successfully", cart));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartSummaryResponse>> getCart() {
        log.info("Get cart for current user");
        CartSummaryResponse cart = cartService.getCart();
        log.info("Cart retrieved successfully - items: {}", cart.getTotalItems());
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> clearCart() {
        log.info("Clearing cart for current user");
        CartSummaryResponse cart = cartService.clearCart();
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", cart));
    }
}
