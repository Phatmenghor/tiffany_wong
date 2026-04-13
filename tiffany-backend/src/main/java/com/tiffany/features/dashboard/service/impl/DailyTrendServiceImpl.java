package com.tiffany.features.dashboard.service.impl;

import com.tiffany.enums.order.OrderStatus;
import com.tiffany.features.auth.repository.UserRepository;
import com.tiffany.features.dashboard.dto.DailyTrendResponse;
import com.tiffany.features.dashboard.service.DailyTrendService;
import com.tiffany.features.order.models.Order;
import com.tiffany.features.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DailyTrendServiceImpl implements DailyTrendService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Override
    public DailyTrendResponse getDailyTrends(int days) {
        log.info("Fetching daily trends for last {} days", days);

        try {
            LocalDateTime startDate = LocalDateTime.now().minusDays(days);
            List<Order> orders = orderRepository.findAllByIsDeletedFalse();
            List<User> users = userRepository.findAllByIsDeletedFalse();

            // Filter orders by date range
            List<Order> filteredOrders = orders.stream()
                    .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startDate))
                    .collect(Collectors.toList());

            // Group orders by date
            Map<String, DailyTrendResponse.DailyData> dailyDataMap = new HashMap<>();

            // Initialize all days with zero values
            for (int i = days - 1; i >= 0; i--) {
                LocalDate date = LocalDate.now().minusDays(i);
                String dateStr = date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                dailyDataMap.put(dateStr, DailyTrendResponse.DailyData.builder()
                        .date(dateStr)
                        .ordersCount(0)
                        .revenue(BigDecimal.ZERO)
                        .completedOrders(0)
                        .newCustomers(0)
                        .totalAmount(BigDecimal.ZERO)
                        .build());
            }

            // Aggregate order data by date
            for (Order order : filteredOrders) {
                if (order.getCreatedAt() == null) continue;

                String dateStr = order.getCreatedAt().toLocalDate()
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

                if (!dailyDataMap.containsKey(dateStr)) {
                    continue;
                }

                DailyTrendResponse.DailyData data = dailyDataMap.get(dateStr);
                data.setOrdersCount(data.getOrdersCount() != null ? data.getOrdersCount() + 1 : 1);
                data.setTotalAmount(data.getTotalAmount() != null
                        ? data.getTotalAmount().add(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO)
                        : order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO);

                if (OrderStatus.COMPLETED.equals(order.getOrderStatus())) {
                    data.setCompletedOrders(data.getCompletedOrders() != null ? data.getCompletedOrders() + 1 : 1);
                }

                data.setRevenue(data.getRevenue() != null
                        ? data.getRevenue().add(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO)
                        : order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO);
            }

            // Aggregate customer data by date
            for (User user : users) {
                if (user.getCreatedAt() == null) continue;

                LocalDateTime userCreatedAt = user.getCreatedAt();
                if (userCreatedAt.isBefore(startDate)) continue;

                String dateStr = userCreatedAt.toLocalDate()
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

                if (dailyDataMap.containsKey(dateStr)) {
                    DailyTrendResponse.DailyData data = dailyDataMap.get(dateStr);
                    data.setNewCustomers(data.getNewCustomers() != null ? data.getNewCustomers() + 1 : 1);
                }
            }

            // Convert map to sorted list
            List<DailyTrendResponse.DailyData> dailyDataList = dailyDataMap.values().stream()
                    .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                    .collect(Collectors.toList());

            log.info("Daily trends fetched successfully for {} days", days);

            return DailyTrendResponse.builder()
                    .dailyData(dailyDataList)
                    .period("Last " + days + " Days")
                    .totalDays(days)
                    .build();

        } catch (Exception e) {
            log.error("Error fetching daily trends: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch daily trends", e);
        }
    }

    @Override
    public DailyTrendResponse getLast30DaysTrends() {
        return getDailyTrends(30);
    }
}
