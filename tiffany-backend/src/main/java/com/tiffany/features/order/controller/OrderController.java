package com.tiffany.features.order.controller;

import com.tiffany.features.order.dto.filter.OrderFilterRequest;
import com.tiffany.features.order.dto.request.OrderCreateRequest;
import com.tiffany.features.order.dto.response.OrderResponse;
import com.tiffany.features.order.dto.update.OrderUpdateRequest;
import com.tiffany.features.order.service.OrderService;
import com.tiffany.shared.dto.ApiResponse;
import com.tiffany.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrderFromCart(@Valid @RequestBody OrderCreateRequest request) {
        log.info("Create order from cart - addressId: {}", request.getAddressId());
        OrderResponse order = orderService.createOrderFromCart(request);
        log.info("Order created successfully - orderNumber: {}, total: {}", order.getOrderNumber(), order.getTotalAmount());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", order));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<OrderResponse>>> getAllOrders(@Valid @RequestBody OrderFilterRequest filter) {
        log.info("Get all orders - page: {}, size: {}", filter.getPageNo(), filter.getPageSize());
        PaginationResponse<OrderResponse> orders = orderService.getAllOrders(filter);
        log.info("Orders retrieved - count: {}, total: {}", orders.getContent().size(), orders.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @PostMapping("/my-orders")
    public ResponseEntity<ApiResponse<PaginationResponse<OrderResponse>>> getMyOrders(@Valid @RequestBody OrderFilterRequest filter) {
        log.info("Get customer orders - page: {}, size: {}", filter.getPageNo(), filter.getPageSize());
        PaginationResponse<OrderResponse> orders = orderService.getCustomerOrderHistory(filter);
        log.info("Customer orders retrieved - count: {}, total: {}", orders.getContent().size(), orders.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success("Order history retrieved successfully", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable UUID id) {
        log.info("Get order by id: {}", id);
        OrderResponse order = orderService.getOrderById(id);
        log.info("Order retrieved - orderNumber: {}, status: {}", order.getOrderNumber(), order.getOrderStatus());
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrder(
            @PathVariable UUID id,
            @Valid @RequestBody OrderUpdateRequest request) {
        log.info("Update order - id: {}, newStatus: {}", id, request.getOrderStatus());
        OrderResponse order = orderService.updateOrder(id, request);
        log.info("Order updated successfully - orderNumber: {}, status: {}", order.getOrderNumber(), order.getOrderStatus());
        return ResponseEntity.ok(ApiResponse.success("Order updated successfully", order));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> deleteOrder(@PathVariable UUID id) {
        log.info("Delete order - id: {}", id);
        OrderResponse orderResponse = orderService.deleteOrder(id);
        log.info("Order deleted successfully - orderNumber: {}", orderResponse.getOrderNumber());
        return ResponseEntity.ok(ApiResponse.success("Order deleted successfully", orderResponse));
    }
}
