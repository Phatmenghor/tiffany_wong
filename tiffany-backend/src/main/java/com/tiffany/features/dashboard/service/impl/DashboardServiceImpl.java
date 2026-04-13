package com.tiffany.features.dashboard.service.impl;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.enums.payment.PaymentMethod;
import com.tiffany.enums.payment.PaymentStatus;
import com.tiffany.features.auth.models.User;
import com.tiffany.features.auth.repository.UserRepository;
import com.tiffany.features.dashboard.dto.*;
import com.tiffany.features.dashboard.service.DashboardService;
import com.tiffany.features.main.repository.ProductRepository;
import com.tiffany.features.order.models.Order;
import com.tiffany.features.order.models.OrderItem;
import com.tiffany.features.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public SalesMetricsResponse getSalesMetrics() {
        log.info("Fetching sales metrics");

        List<Order> allOrders = orderRepository.findAllByIsDeletedFalse();

        BigDecimal totalRevenue = allOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Integer totalOrders = allOrders.size();

        Set<Long> uniqueCustomers = allOrders.stream()
                .map(Order::getCustomerId)
                .filter(Objects::nonNull)
                .map(Object::hashCode)
                .collect(Collectors.toSet());
        Integer activeCustomers = uniqueCustomers.size();

        BigDecimal averageOrderValue = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, BigDecimal.ROUND_HALF_UP)
                : BigDecimal.ZERO;

        // Revenue Trend (last 30 days)
        List<SalesMetricsResponse.DailyRevenueDTO> revenueTrend = buildDailyRevenueTrend(allOrders);

        // Orders by Status
        List<SalesMetricsResponse.OrderStatusCountDTO> ordersByStatus = buildOrdersByStatus(allOrders);

        // Payment Status Distribution
        List<SalesMetricsResponse.PaymentStatusCountDTO> paymentStatusDistribution = buildPaymentStatusDistribution(allOrders);

        // Top Products
        List<SalesMetricsResponse.TopProductDTO> topProducts = buildTopProducts(allOrders, 10);

        // Sales by Payment Method
        List<SalesMetricsResponse.PaymentMethodDTO> salesByPaymentMethod = buildSalesByPaymentMethod(allOrders);

        return SalesMetricsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .activeCustomers(activeCustomers)
                .averageOrderValue(averageOrderValue)
                .revenueTrend(revenueTrend)
                .ordersByStatus(ordersByStatus)
                .paymentStatusDistribution(paymentStatusDistribution)
                .topProducts(topProducts)
                .salesByPaymentMethod(salesByPaymentMethod)
                .build();
    }

    @Override
    public OrderMetricsResponse getOrderMetrics() {
        log.info("Fetching order metrics");

        List<Order> allOrders = orderRepository.findAllByIsDeletedFalse();

        Integer totalOrders = allOrders.size();
        Integer pendingOrders = (int) allOrders.stream()
                .filter(o -> OrderStatus.PENDING.equals(o.getOrderStatus())).count();
        Integer confirmedOrders = (int) allOrders.stream()
                .filter(o -> OrderStatus.CONFIRMED.equals(o.getOrderStatus())).count();
        Integer completedOrders = (int) allOrders.stream()
                .filter(o -> OrderStatus.COMPLETED.equals(o.getOrderStatus())).count();
        Integer cancelledOrders = (int) allOrders.stream()
                .filter(o -> OrderStatus.CANCELLED.equals(o.getOrderStatus())).count();

        Double fulfillmentRate = totalOrders > 0 ? (completedOrders * 100.0) / totalOrders : 0.0;

        // Orders by Status
        List<OrderMetricsResponse.OrderStatusDTO> ordersByStatus = Arrays.stream(OrderStatus.values())
                .map(status -> {
                    Integer count = (int) allOrders.stream()
                            .filter(o -> status.equals(o.getOrderStatus()))
                            .count();
                    return OrderMetricsResponse.OrderStatusDTO.builder()
                            .status(status.toString())
                            .count(count)
                            .build();
                })
                .collect(Collectors.toList());

        // Recent Orders (last 20)
        List<OrderMetricsResponse.RecentOrderDTO> recentOrders = allOrders.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                .limit(20)
                .map(this::mapToRecentOrderDTO)
                .collect(Collectors.toList());

        return OrderMetricsResponse.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .confirmedOrders(confirmedOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .fulfillmentRate(fulfillmentRate)
                .ordersByStatus(ordersByStatus)
                .recentOrders(recentOrders)
                .build();
    }

    @Override
    public ProductMetricsResponse getProductMetrics() {
        log.info("Fetching product metrics");

        List<Order> allOrders = orderRepository.findAllByIsDeletedFalse();

        Integer totalProducts = (int) productRepository.count();
        Integer activeProducts = (int) productRepository.findAll().stream()
                .filter(p -> p.getStatus() != null && "ACTIVE".equals(p.getStatus().toString()))
                .count();
        Integer inactiveProducts = totalProducts - activeProducts;
        Integer productsWithPromotion = (int) productRepository.findAll().stream()
                .filter(p -> p.getPromotionFromDate() != null && p.getPromotionToDate() != null
                        && LocalDateTime.now().isAfter(p.getPromotionFromDate())
                        && LocalDateTime.now().isBefore(p.getPromotionToDate()))
                .count();

        // Top Products by Revenue
        List<ProductMetricsResponse.ProductPerformanceDTO> topProductsByRevenue = buildTopProductsByRevenue(allOrders, 10);

        // Top Products by Views
        List<ProductMetricsResponse.ProductPerformanceDTO> topProductsByViews = buildTopProductsByViews(10);

        // Top Products by Favorites
        List<ProductMetricsResponse.ProductPerformanceDTO> topProductsByFavorites = buildTopProductsByFavorites(10);

        // Products by Category
        List<ProductMetricsResponse.CategoryCountDTO> productsByCategory = buildProductsByCategory(allOrders);

        // Lowest Performance
        List<ProductMetricsResponse.ProductPerformanceDTO> lowestPerformance = buildLowestPerformanceProducts(allOrders, 10);

        return ProductMetricsResponse.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .inactiveProducts(inactiveProducts)
                .productsWithPromotion(productsWithPromotion)
                .topProductsByRevenue(topProductsByRevenue)
                .topProductsByViews(topProductsByViews)
                .topProductsByFavorites(topProductsByFavorites)
                .productsByCategory(productsByCategory)
                .lowestPerformanceProducts(lowestPerformance)
                .build();
    }

    @Override
    public CustomerMetricsResponse getCustomerMetrics() {
        log.info("Fetching customer metrics");

        List<User> allCustomers = userRepository.findAllByIsDeletedFalse();
        List<Order> allOrders = orderRepository.findAllByIsDeletedFalse();

        Integer totalCustomers = allCustomers.size();
        Integer activeCustomers = (int) allCustomers.stream()
                .filter(u -> u.isActive())
                .count();

        YearMonth currentMonth = YearMonth.now();
        Integer newCustomersThisMonth = (int) allCustomers.stream()
                .filter(u -> u.getCreatedAt() != null
                        && YearMonth.from(u.getCreatedAt()).equals(currentMonth))
                .count();

        // Top Customers by Revenue
        List<CustomerMetricsResponse.TopCustomerDTO> topCustomers = buildTopCustomers(allOrders, 10);

        // New Customers This Month
        List<CustomerMetricsResponse.NewCustomerDTO> newCustomers = buildNewCustomers(allOrders, currentMonth);

        BigDecimal totalCustomerValue = allOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageCustomerValue = totalCustomers > 0
                ? totalCustomerValue.divide(BigDecimal.valueOf(totalCustomers), 2, BigDecimal.ROUND_HALF_UP)
                : BigDecimal.ZERO;

        return CustomerMetricsResponse.builder()
                .totalCustomers(totalCustomers)
                .activeCustomers(activeCustomers)
                .newCustomersThisMonth(newCustomersThisMonth)
                .totalCustomerValue(totalCustomerValue)
                .averageCustomerValue(averageCustomerValue)
                .topCustomers(topCustomers)
                .newCustomers(newCustomers)
                .build();
    }

    @Override
    public PaymentMetricsResponse getPaymentMetrics() {
        log.info("Fetching payment metrics");

        List<Order> allOrders = orderRepository.findAllByIsDeletedFalse();

        Integer totalOrders = allOrders.size();
        Integer paidOrders = (int) allOrders.stream()
                .filter(o -> PaymentStatus.PAID.equals(o.getPaymentStatus())).count();
        Integer unpaidOrders = (int) allOrders.stream()
                .filter(o -> PaymentStatus.UNPAID.equals(o.getPaymentStatus())).count();
        Integer refundedOrders = (int) allOrders.stream()
                .filter(o -> PaymentStatus.REFUNDED.equals(o.getPaymentStatus())).count();

        BigDecimal totalRevenuePaid = allOrders.stream()
                .filter(o -> PaymentStatus.PAID.equals(o.getPaymentStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRevenueUnpaid = allOrders.stream()
                .filter(o -> PaymentStatus.UNPAID.equals(o.getPaymentStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRevenueRefunded = allOrders.stream()
                .filter(o -> PaymentStatus.REFUNDED.equals(o.getPaymentStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Double paymentRate = totalOrders > 0 ? (paidOrders * 100.0) / totalOrders : 0.0;

        // Payment Status Distribution
        List<PaymentMetricsResponse.PaymentStatusDTO> paymentStatusDistribution = Arrays.stream(PaymentStatus.values())
                .map(status -> {
                    Integer count = (int) allOrders.stream()
                            .filter(o -> status.equals(o.getPaymentStatus()))
                            .count();
                    BigDecimal amount = allOrders.stream()
                            .filter(o -> status.equals(o.getPaymentStatus()))
                            .map(Order::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    Double percentage = totalOrders > 0 ? (count * 100.0) / totalOrders : 0.0;
                    return PaymentMetricsResponse.PaymentStatusDTO.builder()
                            .status(status.toString())
                            .count(count)
                            .amount(amount)
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());

        // Revenue by Payment Method
        List<PaymentMetricsResponse.PaymentMethodRevenueDTO> revenueByPaymentMethod = Arrays.stream(PaymentMethod.values())
                .map(method -> {
                    Integer count = (int) allOrders.stream()
                            .filter(o -> method.equals(o.getPaymentMethod()))
                            .count();
                    BigDecimal amount = allOrders.stream()
                            .filter(o -> method.equals(o.getPaymentMethod()))
                            .map(Order::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    Double percentage = totalOrders > 0 ? (count * 100.0) / totalOrders : 0.0;
                    return PaymentMetricsResponse.PaymentMethodRevenueDTO.builder()
                            .method(method.toString())
                            .count(count)
                            .amount(amount)
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());

        return PaymentMetricsResponse.builder()
                .totalOrders(totalOrders)
                .paidOrders(paidOrders)
                .unpaidOrders(unpaidOrders)
                .refundedOrders(refundedOrders)
                .totalRevenuePaid(totalRevenuePaid)
                .totalRevenueUnpaid(totalRevenueUnpaid)
                .totalRevenueRefunded(totalRevenueRefunded)
                .paymentRate(paymentRate)
                .paymentStatusDistribution(paymentStatusDistribution)
                .revenueByPaymentMethod(revenueByPaymentMethod)
                .build();
    }

    // Helper Methods
    private List<SalesMetricsResponse.DailyRevenueDTO> buildDailyRevenueTrend(List<Order> orders) {
        Map<LocalDate, List<Order>> ordersByDate = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().toLocalDate()));

        return ordersByDate.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> SalesMetricsResponse.DailyRevenueDTO.builder()
                        .date(entry.getKey())
                        .revenue(entry.getValue().stream()
                                .map(Order::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add))
                        .orderCount(entry.getValue().size())
                        .build())
                .collect(Collectors.toList());
    }

    private List<SalesMetricsResponse.OrderStatusCountDTO> buildOrdersByStatus(List<Order> orders) {
        return Arrays.stream(OrderStatus.values())
                .map(status -> {
                    List<Order> statusOrders = orders.stream()
                            .filter(o -> status.equals(o.getOrderStatus()))
                            .collect(Collectors.toList());
                    return SalesMetricsResponse.OrderStatusCountDTO.builder()
                            .status(status.toString())
                            .count(statusOrders.size())
                            .totalAmount(statusOrders.stream()
                                    .map(Order::getTotalAmount)
                                    .reduce(BigDecimal.ZERO, BigDecimal::add))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<SalesMetricsResponse.PaymentStatusCountDTO> buildPaymentStatusDistribution(List<Order> orders) {
        return Arrays.stream(PaymentStatus.values())
                .map(status -> {
                    List<Order> statusOrders = orders.stream()
                            .filter(o -> status.equals(o.getPaymentStatus()))
                            .collect(Collectors.toList());
                    return SalesMetricsResponse.PaymentStatusCountDTO.builder()
                            .status(status.toString())
                            .count(statusOrders.size())
                            .amount(statusOrders.stream()
                                    .map(Order::getTotalAmount)
                                    .reduce(BigDecimal.ZERO, BigDecimal::add))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<SalesMetricsResponse.TopProductDTO> buildTopProducts(List<Order> orders, int limit) {
        Map<String, List<OrderItem>> itemsByProduct = orders.stream()
                .flatMap(o -> o.getItems().stream())
                .collect(Collectors.groupingBy(OrderItem::getProductName));

        return itemsByProduct.entrySet().stream()
                .map(entry -> {
                    List<OrderItem> items = entry.getValue();
                    Integer totalQty = items.stream().mapToInt(OrderItem::getQuantity).sum();
                    BigDecimal totalRevenue = items.stream()
                            .map(OrderItem::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return SalesMetricsResponse.TopProductDTO.builder()
                            .productId(items.get(0).getProductId().toString())
                            .productName(entry.getKey())
                            .quantity(totalQty)
                            .revenue(totalRevenue)
                            .build();
                })
                .sorted(Comparator.comparing(SalesMetricsResponse.TopProductDTO::getRevenue).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<SalesMetricsResponse.PaymentMethodDTO> buildSalesByPaymentMethod(List<Order> orders) {
        return Arrays.stream(PaymentMethod.values())
                .map(method -> {
                    List<Order> methodOrders = orders.stream()
                            .filter(o -> method.equals(o.getPaymentMethod()))
                            .collect(Collectors.toList());
                    return SalesMetricsResponse.PaymentMethodDTO.builder()
                            .method(method.toString())
                            .count(methodOrders.size())
                            .amount(methodOrders.stream()
                                    .map(Order::getTotalAmount)
                                    .reduce(BigDecimal.ZERO, BigDecimal::add))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private OrderMetricsResponse.RecentOrderDTO mapToRecentOrderDTO(Order order) {
        return OrderMetricsResponse.RecentOrderDTO.builder()
                .orderId(order.getId().toString())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getCustomerName() != null ? order.getCustomerName() : "Guest")
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus().toString())
                .paymentStatus(order.getPaymentStatus().toString())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private List<ProductMetricsResponse.ProductPerformanceDTO> buildTopProductsByRevenue(List<Order> orders, int limit) {
        return buildTopProducts(orders, limit).stream()
                .map(dto -> ProductMetricsResponse.ProductPerformanceDTO.builder()
                        .productId(dto.getProductId())
                        .productName(dto.getProductName())
                        .quantity(dto.getQuantity())
                        .revenue(dto.getRevenue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<ProductMetricsResponse.ProductPerformanceDTO> buildTopProductsByViews(int limit) {
        return productRepository.findAll().stream()
                .sorted(Comparator.comparing(p -> p.getViewCount() != null ? p.getViewCount() : 0, Comparator.reverseOrder()))
                .limit(limit)
                .map(p -> ProductMetricsResponse.ProductPerformanceDTO.builder()
                        .productId(p.getId().toString())
                        .productName(p.getName())
                        .price(p.getPrice())
                        .viewCount(p.getViewCount() != null ? p.getViewCount() : 0)
                        .build())
                .collect(Collectors.toList());
    }

    private List<ProductMetricsResponse.ProductPerformanceDTO> buildTopProductsByFavorites(int limit) {
        return productRepository.findAll().stream()
                .sorted(Comparator.comparing(p -> p.getFavoriteCount() != null ? p.getFavoriteCount() : 0, Comparator.reverseOrder()))
                .limit(limit)
                .map(p -> ProductMetricsResponse.ProductPerformanceDTO.builder()
                        .productId(p.getId().toString())
                        .productName(p.getName())
                        .price(p.getPrice())
                        .favoriteCount(p.getFavoriteCount() != null ? p.getFavoriteCount() : 0)
                        .build())
                .collect(Collectors.toList());
    }

    private List<ProductMetricsResponse.CategoryCountDTO> buildProductsByCategory(List<Order> orders) {
        return productRepository.findAll().stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(p -> p.getCategory().getName()))
                .entrySet().stream()
                .map(entry -> {
                    BigDecimal revenue = orders.stream()
                            .flatMap(o -> o.getItems().stream())
                            .filter(item -> entry.getValue().stream()
                                    .anyMatch(p -> p.getId().toString().equals(item.getProductId().toString())))
                            .map(OrderItem::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return ProductMetricsResponse.CategoryCountDTO.builder()
                            .categoryId(entry.getValue().get(0).getCategory().getId().toString())
                            .categoryName(entry.getKey())
                            .productCount(entry.getValue().size())
                            .revenue(revenue)
                            .build();
                })
                .sorted(Comparator.comparing(ProductMetricsResponse.CategoryCountDTO::getProductCount).reversed())
                .collect(Collectors.toList());
    }

    private List<ProductMetricsResponse.ProductPerformanceDTO> buildLowestPerformanceProducts(List<Order> orders, int limit) {
        Set<String> soldProductIds = orders.stream()
                .flatMap(o -> o.getItems().stream())
                .map(item -> item.getProductId().toString())
                .collect(Collectors.toSet());

        return productRepository.findAll().stream()
                .filter(p -> !soldProductIds.contains(p.getId().toString()))
                .limit(limit)
                .map(p -> ProductMetricsResponse.ProductPerformanceDTO.builder()
                        .productId(p.getId().toString())
                        .productName(p.getName())
                        .price(p.getPrice())
                        .quantity(0)
                        .revenue(BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());
    }

    private List<CustomerMetricsResponse.TopCustomerDTO> buildTopCustomers(List<Order> orders, int limit) {
        return orders.stream()
                .collect(Collectors.groupingBy(Order::getCustomerId))
                .entrySet().stream()
                .map(entry -> {
                    List<Order> customerOrders = entry.getValue();
                    BigDecimal totalSpent = customerOrders.stream()
                            .map(Order::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return CustomerMetricsResponse.TopCustomerDTO.builder()
                            .customerId(entry.getKey().toString())
                            .customerName(customerOrders.get(0).getCustomerName())
                            .email(customerOrders.get(0).getCustomerEmail())
                            .phoneNumber(customerOrders.get(0).getCustomerPhone())
                            .orderCount(customerOrders.size())
                            .totalSpent(totalSpent)
                            .lastOrderDate(customerOrders.stream()
                                    .map(Order::getCreatedAt)
                                    .max(LocalDateTime::compareTo)
                                    .orElse(null))
                            .build();
                })
                .sorted(Comparator.comparing(CustomerMetricsResponse.TopCustomerDTO::getTotalSpent).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<CustomerMetricsResponse.NewCustomerDTO> buildNewCustomers(List<Order> orders, YearMonth month) {
        Set<Long> newCustomerIds = userRepository.findAllByIsDeletedFalse().stream()
                .filter(u -> u.getCreatedAt() != null && YearMonth.from(u.getCreatedAt()).equals(month))
                .map(u -> u.getId().getMostSignificantBits())
                .collect(Collectors.toSet());

        return orders.stream()
                .filter(o -> newCustomerIds.contains(o.getCustomerId().getMostSignificantBits()))
                .distinct()
                .map(o -> CustomerMetricsResponse.NewCustomerDTO.builder()
                        .customerId(o.getCustomerId().toString())
                        .customerName(o.getCustomerName())
                        .email(o.getCustomerEmail())
                        .registeredDate(o.getCreatedAt())
                        .orders(1)
                        .totalSpent(o.getTotalAmount())
                        .build())
                .collect(Collectors.toList());
    }
}
