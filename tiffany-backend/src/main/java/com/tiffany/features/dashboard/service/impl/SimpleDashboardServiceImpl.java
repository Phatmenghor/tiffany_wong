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
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

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
            // Get all orders
            List<Order> allOrders = orderRepository.findAllByIsDeletedFalse();

            // Basic counts
            Integer totalOrders = allOrders.size();
            Integer pendingOrders = (int) allOrders.stream()
                    .filter(o -> OrderStatus.PENDING.equals(o.getOrderStatus())).count();
            Integer completedOrders = (int) allOrders.stream()
                    .filter(o -> OrderStatus.COMPLETED.equals(o.getOrderStatus())).count();
            Integer paidOrders = (int) allOrders.stream()
                    .filter(o -> PaymentStatus.PAID.equals(o.getPaymentStatus())).count();
            Integer unpaidOrders = (int) allOrders.stream()
                    .filter(o -> PaymentStatus.UNPAID.equals(o.getPaymentStatus())).count();

            // Revenue calculations
            BigDecimal totalRevenue = allOrders.stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalPaid = allOrders.stream()
                    .filter(o -> PaymentStatus.PAID.equals(o.getPaymentStatus()))
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalUnpaid = allOrders.stream()
                    .filter(o -> PaymentStatus.UNPAID.equals(o.getPaymentStatus()))
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Customer metrics
            Integer totalCustomers = (int) userRepository.findAllByIsDeletedFalse().size();
            Integer newCustomersThisMonth = (int) userRepository.findAllByIsDeletedFalse().stream()
                    .filter(u -> u.getCreatedAt() != null &&
                            YearMonth.from(u.getCreatedAt()).equals(YearMonth.now()))
                    .count();

            // Product metrics
            Integer totalProducts = (int) productRepository.count();
            Integer activeProducts = (int) productRepository.findAll().stream()
                    .filter(p -> p.getStatus() != null && "ACTIVE".equals(p.getStatus().toString()))
                    .count();

            // Calculated metrics
            Double fulfillmentRate = totalOrders > 0 ? (completedOrders * 100.0) / totalOrders : 0.0;
            Double paymentRate = totalOrders > 0 ? (paidOrders * 100.0) / totalOrders : 0.0;
            BigDecimal averageOrderValue = totalOrders > 0
                    ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, BigDecimal.ROUND_HALF_UP)
                    : BigDecimal.ZERO;

            log.info("Simple dashboard metrics retrieved successfully");

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
