package com.tiffany.features.dashboard.service.impl;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.enums.payment.PaymentStatus;
import com.tiffany.features.auth.repository.UserRepository;
import com.tiffany.features.dashboard.dto.SimpleDashboardResponse;
import com.tiffany.features.dashboard.service.SimpleDashboardService;
import com.tiffany.features.main.repository.ProductRepository;
import com.tiffany.features.order.models.Order;
import com.tiffany.features.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SimpleDashboardServiceImpl implements SimpleDashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public SimpleDashboardResponse getSimpleDashboard() {
        log.info("Fetching simple dashboard metrics");

        try {
            // Use optimized database queries - all filtering done at database level
            Integer totalOrders = (int) orderRepository.countAllOrders();
            Integer pendingOrders = (int) orderRepository.countByOrderStatus(OrderStatus.PENDING);
            Integer completedOrders = (int) orderRepository.countByOrderStatus(OrderStatus.COMPLETED);
            Integer paidOrders = (int) orderRepository.countByPaymentStatus(PaymentStatus.PAID);
            Integer unpaidOrders = (int) orderRepository.countByPaymentStatus(PaymentStatus.UNPAID);

            // Revenue calculations using database aggregation
            BigDecimal totalRevenue = orderRepository.sumTotalAmount();
            BigDecimal totalPaid = orderRepository.sumTotalAmountByPaymentStatus(PaymentStatus.PAID);
            BigDecimal totalUnpaid = orderRepository.sumTotalAmountByPaymentStatus(PaymentStatus.UNPAID);

            // Customer metrics using optimized queries
            Integer totalCustomers = (int) userRepository.countAllByIsDeletedFalse();
            Integer newCustomersThisMonth = (int) userRepository.countNewCustomersThisMonth();

            // Product metrics using optimized queries
            Integer totalProducts = (int) productRepository.countAllProducts();
            Integer activeProducts = (int) productRepository.countActiveProducts();

            // Calculated metrics
            Double fulfillmentRate = totalOrders > 0 ? (completedOrders * 100.0) / totalOrders : 0.0;
            Double paymentRate = totalOrders > 0 ? (paidOrders * 100.0) / totalOrders : 0.0;
            BigDecimal averageOrderValue = totalOrders > 0
                    ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, BigDecimal.ROUND_HALF_UP)
                    : BigDecimal.ZERO;

            log.info("Simple dashboard metrics retrieved successfully - totalOrders: {}, totalRevenue: {}", totalOrders, totalRevenue);

            return SimpleDashboardResponse.builder()
                    .totalRevenue(totalRevenue)
                    .totalOrders(totalOrders)
                    .pendingOrders(pendingOrders)
                    .completedOrders(completedOrders)
                    .totalCustomers(totalCustomers)
                    .newCustomersThisMonth(newCustomersThisMonth)
                    .totalProducts(totalProducts)
                    .activeProducts(activeProducts)
                    .paidOrders(paidOrders)
                    .unpaidOrders(unpaidOrders)
                    .totalPaid(totalPaid)
                    .totalUnpaid(totalUnpaid)
                    .fulfillmentRate(fulfillmentRate)
                    .paymentRate(paymentRate)
                    .averageOrderValue(averageOrderValue)
                    .build();
        } catch (Exception e) {
            log.error("Error fetching dashboard metrics: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch dashboard metrics", e);
        }
    }
}
