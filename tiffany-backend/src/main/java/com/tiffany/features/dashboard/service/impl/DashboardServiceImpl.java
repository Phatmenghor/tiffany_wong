package com.tiffany.features.dashboard.service.impl;

import com.tiffany.features.dashboard.dto.*;
import com.tiffany.features.dashboard.service.DashboardService;
import com.tiffany.features.dashboard.util.DashboardPeriodUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private static final int RECENT_ORDERS_LIMIT = 10;
    private static final int TOP_PRODUCTS_LIMIT  = 8;
    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    @PersistenceContext
    private EntityManager em;

    @Override
    public DashboardSummaryResponse getSummary(String period) {
        LocalDateTime[] today     = DashboardPeriodUtil.getTodayRange();
        LocalDateTime[] yesterday = DashboardPeriodUtil.getYesterdayRange();

        BigDecimal salesToday     = queryRevenue(today[0], today[1]);
        BigDecimal salesYesterday = queryRevenue(yesterday[0], yesterday[1]);
        long ordersToday     = queryOrderCount(today[0], today[1]);
        long ordersYesterday = queryOrderCount(yesterday[0], yesterday[1]);
        long pendingOrders   = queryPendingCount();

        BigDecimal avg = ordersToday > 0
            ? salesToday.divide(BigDecimal.valueOf(ordersToday), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        return DashboardSummaryResponse.builder()
            .totalSalesToday(salesToday)
            .totalOrdersToday(ordersToday)
            .totalSalesChange(DashboardPeriodUtil.percentageChange(
                salesToday.doubleValue(), salesYesterday.doubleValue()))
            .totalOrdersChange(DashboardPeriodUtil.percentageChange(
                (double) ordersToday, (double) ordersYesterday))
            .lowStockItems(0L)
            .systemAlerts(pendingOrders)
            .activeStaff(0L)
            .avgOrderValue(avg)
            .build();
    }

    @Override
    public DashboardSalesResponse getSales(String period) {
        LocalDateTime[] range = DashboardPeriodUtil.getRange(period);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(
            "SELECT DATE(created_at) AS day, " +
            "       COALESCE(SUM(total_amount), 0) AS revenue, " +
            "       COUNT(*) AS orders " +
            "FROM orders " +
            "WHERE created_at >= :start AND created_at < :end " +
            "  AND order_status = 'COMPLETED' " +
            "  AND is_deleted = false " +
            "GROUP BY DATE(created_at) " +
            "ORDER BY DATE(created_at)")
            .setParameter("start", range[0])
            .setParameter("end",   range[1])
            .getResultList();

        List<DashboardSalesResponse.SalesDataPoint> points = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        long totalOrders = 0;

        for (Object[] row : rows) {
            BigDecimal rev = toBigDecimal(row[1]);
            long orders    = toLong(row[2]);
            points.add(DashboardSalesResponse.SalesDataPoint.builder()
                .date(row[0] != null ? row[0].toString() : "")
                .revenue(rev).orders(orders).build());
            totalRevenue = totalRevenue.add(rev);
            totalOrders  += orders;
        }

        return DashboardSalesResponse.builder()
            .data(points).totalRevenue(totalRevenue)
            .totalOrders(totalOrders).period(period).build();
    }

    @Override
    public DashboardPaymentsResponse getPayments(String period) {
        LocalDateTime[] range = DashboardPeriodUtil.getRange(period);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(
            "SELECT payment_method, " +
            "       COALESCE(SUM(total_amount), 0) AS amount, " +
            "       COUNT(*) AS cnt " +
            "FROM orders " +
            "WHERE created_at >= :start AND created_at < :end " +
            "  AND payment_method IS NOT NULL " +
            "  AND is_deleted = false " +
            "GROUP BY payment_method")
            .setParameter("start", range[0])
            .setParameter("end",   range[1])
            .getResultList();

        BigDecimal totalAmount = BigDecimal.ZERO;
        long totalCount = 0;
        List<DashboardPaymentsResponse.PaymentMethodData> items = new ArrayList<>();

        for (Object[] row : rows) {
            BigDecimal amt = toBigDecimal(row[1]);
            long cnt       = toLong(row[2]);
            totalAmount    = totalAmount.add(amt);
            totalCount     += cnt;
            items.add(DashboardPaymentsResponse.PaymentMethodData.builder()
                .method(str(row[0])).amount(amt).count(cnt).percentage(0.0).build());
        }

        final BigDecimal total = totalAmount.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ONE : totalAmount;
        items.forEach(item -> item.setPercentage(
            item.getAmount().divide(total, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue()));

        return DashboardPaymentsResponse.builder()
            .data(items).totalAmount(totalAmount).totalCount(totalCount).build();
    }

    @Override
    public DashboardStockResponse getStock() {
        return DashboardStockResponse.builder()
            .data(new ArrayList<>()).lowStockCount(0L).outOfStockCount(0L).build();
    }

    @Override
    public DashboardOrdersResponse getRecentOrders(String period) {
        LocalDateTime[] range = DashboardPeriodUtil.getRange(period);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(
            "SELECT o.id, o.order_number, o.customer_name, o.total_amount, " +
            "       o.order_status, o.payment_method, o.created_at, " +
            "       (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id AND oi.is_deleted = false) AS item_count " +
            "FROM orders o " +
            "WHERE o.created_at >= :start AND o.created_at < :end " +
            "  AND o.is_deleted = false " +
            "ORDER BY o.created_at DESC " +
            "LIMIT :lim")
            .setParameter("start", range[0])
            .setParameter("end",   range[1])
            .setParameter("lim",   RECENT_ORDERS_LIMIT)
            .getResultList();

        long totalCount = queryOrderCount(range[0], range[1]);
        List<DashboardOrdersResponse.DashboardOrderItem> items = new ArrayList<>();

        for (Object[] row : rows) {
            LocalDateTime createdAt = row[6] instanceof LocalDateTime ldt ? ldt : null;
            items.add(DashboardOrdersResponse.DashboardOrderItem.builder()
                .id(toUUID(row[0])).orderCode(str(row[1])).customerName(str(row[2]))
                .totalAmount(toBigDecimal(row[3])).status(str(row[4])).paymentMethod(str(row[5]))
                .createdAt(createdAt != null ? createdAt.format(DT_FMT) : "")
                .itemCount(toInt(row[7])).build());
        }

        return DashboardOrdersResponse.builder().data(items).totalElements(totalCount).build();
    }

    @Override
    public DashboardTopProductsResponse getTopProducts(String period) {
        LocalDateTime[] range = DashboardPeriodUtil.getRange(period);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(
            "SELECT oi.product_id, oi.product_name, " +
            "       SUM(oi.quantity) AS units_sold, " +
            "       SUM(oi.total_price) AS revenue, " +
            "       MAX(oi.product_image_url) AS image_url " +
            "FROM order_items oi " +
            "JOIN orders o ON o.id = oi.order_id " +
            "WHERE o.created_at >= :start AND o.created_at < :end " +
            "  AND o.is_deleted = false AND oi.is_deleted = false " +
            "GROUP BY oi.product_id, oi.product_name " +
            "ORDER BY units_sold DESC " +
            "LIMIT :lim")
            .setParameter("start", range[0])
            .setParameter("end",   range[1])
            .setParameter("lim",   TOP_PRODUCTS_LIMIT)
            .getResultList();

        List<DashboardTopProductsResponse.DashboardTopProduct> items = new ArrayList<>();
        for (Object[] row : rows) {
            items.add(DashboardTopProductsResponse.DashboardTopProduct.builder()
                .id(toUUID(row[0])).name(str(row[1])).unitsSold(toLong(row[2]))
                .revenue(toBigDecimal(row[3])).category("").imageUrl(str(row[4])).build());
        }

        return DashboardTopProductsResponse.builder().data(items).period(period).build();
    }

    @Override
    public DashboardHourlySalesResponse getHourlySales(String period) {
        LocalDateTime[] range = DashboardPeriodUtil.getRange(period);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(
            "SELECT EXTRACT(HOUR FROM created_at) AS hour, " +
            "       COALESCE(SUM(total_amount), 0) AS revenue, " +
            "       COUNT(*) AS orders " +
            "FROM orders " +
            "WHERE created_at >= :start AND created_at < :end " +
            "  AND is_deleted = false " +
            "GROUP BY EXTRACT(HOUR FROM created_at) " +
            "ORDER BY hour")
            .setParameter("start", range[0])
            .setParameter("end",   range[1])
            .getResultList();

        Map<Integer, Object[]> byHour = new LinkedHashMap<>();
        for (Object[] r : rows) byHour.put(toInt(r[0]), r);

        int nowHour = LocalDateTime.now().getHour();
        List<DashboardHourlySalesResponse.HourlySalesPoint> points = new ArrayList<>();
        int peakHour = 0;
        BigDecimal peakRev = BigDecimal.ZERO;

        for (int h = 0; h <= 23; h++) {
            BigDecimal rev; long orders;
            if (byHour.containsKey(h)) {
                Object[] r = byHour.get(h);
                rev = toBigDecimal(r[1]); orders = toLong(r[2]);
            } else {
                rev = BigDecimal.ZERO; orders = 0;
            }
            if (rev.compareTo(peakRev) > 0) { peakRev = rev; peakHour = h; }
            points.add(DashboardHourlySalesResponse.HourlySalesPoint.builder()
                .hour(h).revenue(rev).orders(orders).build());
        }

        return DashboardHourlySalesResponse.builder()
            .data(points).peakHour(peakHour).currentHour(nowHour).build();
    }

    @Override
    public DashboardCustomerStatsResponse getCustomerStats(String period) {
        LocalDateTime[] range = DashboardPeriodUtil.getRange(period);

        Object totalResult = em.createNativeQuery(
            "SELECT COUNT(DISTINCT COALESCE(customer_id::text, customer_name)) " +
            "FROM orders WHERE created_at >= :start AND created_at < :end AND is_deleted = false")
            .setParameter("start", range[0]).setParameter("end", range[1]).getSingleResult();

        Object returningResult = em.createNativeQuery(
            "SELECT COUNT(DISTINCT o.customer_id) FROM orders o " +
            "WHERE o.created_at >= :start AND o.created_at < :end " +
            "  AND o.customer_id IS NOT NULL AND o.is_deleted = false " +
            "  AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = o.customer_id " +
            "              AND o2.created_at < :start AND o2.is_deleted = false)")
            .setParameter("start", range[0]).setParameter("end", range[1]).getSingleResult();

        long total     = toLong(totalResult);
        long returning = toLong(returningResult);
        long newCust   = Math.max(0, total - returning);
        double rate    = total > 0 ? (returning * 100.0 / total) : 0.0;

        BigDecimal revenue = queryRevenue(range[0], range[1]);
        long orders        = queryOrderCount(range[0], range[1]);
        BigDecimal avg     = orders > 0
            ? revenue.divide(BigDecimal.valueOf(orders), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        return DashboardCustomerStatsResponse.builder()
            .totalCustomers(total).newCustomers(newCust).returningCustomers(returning)
            .returnRate(rate).avgOrderValue(avg).build();
    }

    @Override
    public DashboardPromotionsResponse getPromotions(String period) {
        LocalDateTime[] range = DashboardPeriodUtil.getRange(period);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(
            "SELECT oi.promotion_type, COUNT(*) AS times_used, " +
            "       COALESCE(SUM(o.total_amount), 0) AS revenue, " +
            "       COALESCE(SUM(oi.promotion_value), 0) AS discount " +
            "FROM order_items oi " +
            "JOIN orders o ON o.id = oi.order_id " +
            "WHERE o.created_at >= :start AND o.created_at < :end " +
            "  AND oi.promotion_type IS NOT NULL " +
            "  AND o.is_deleted = false AND oi.is_deleted = false " +
            "GROUP BY oi.promotion_type ORDER BY times_used DESC LIMIT 10")
            .setParameter("start", range[0]).setParameter("end", range[1]).getResultList();

        List<DashboardPromotionsResponse.DashboardPromotion> items = new ArrayList<>();
        int idx = 1;
        for (Object[] row : rows) {
            String dtype = str(row[0]);
            items.add(DashboardPromotionsResponse.DashboardPromotion.builder()
                .id(String.valueOf(idx++)).name(friendlyType(dtype)).type(dtype)
                .timesUsed(toLong(row[1])).revenueGenerated(toBigDecimal(row[2]))
                .discountGiven(toBigDecimal(row[3])).build());
        }
        return DashboardPromotionsResponse.builder().data(items).build();
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private BigDecimal queryRevenue(LocalDateTime start, LocalDateTime end) {
        Object r = em.createNativeQuery(
            "SELECT COALESCE(SUM(total_amount), 0) FROM orders " +
            "WHERE created_at >= :start AND created_at < :end AND order_status = 'COMPLETED' AND is_deleted = false")
            .setParameter("start", start).setParameter("end", end).getSingleResult();
        return toBigDecimal(r);
    }

    private long queryOrderCount(LocalDateTime start, LocalDateTime end) {
        Object r = em.createNativeQuery(
            "SELECT COUNT(*) FROM orders WHERE created_at >= :start AND created_at < :end AND is_deleted = false")
            .setParameter("start", start).setParameter("end", end).getSingleResult();
        return toLong(r);
    }

    private long queryPendingCount() {
        Object r = em.createNativeQuery(
            "SELECT COUNT(*) FROM orders WHERE order_status = 'PENDING' AND is_deleted = false")
            .getSingleResult();
        return toLong(r);
    }

    private BigDecimal toBigDecimal(Object v) {
        if (v == null) return BigDecimal.ZERO;
        if (v instanceof BigDecimal bd) return bd;
        if (v instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        try { return new BigDecimal(v.toString()); } catch (Exception e) { return BigDecimal.ZERO; }
    }

    private long toLong(Object v) {
        if (v == null) return 0L;
        if (v instanceof Number n) return n.longValue();
        try { return Long.parseLong(v.toString()); } catch (Exception e) { return 0L; }
    }

    private int toInt(Object v) {
        if (v == null) return 0;
        if (v instanceof Number n) return n.intValue();
        try { return Integer.parseInt(v.toString()); } catch (Exception e) { return 0; }
    }

    private String str(Object v) { return v != null ? v.toString() : ""; }

    private UUID toUUID(Object v) {
        if (v == null) return null;
        if (v instanceof UUID u) return u;
        try { return UUID.fromString(v.toString()); } catch (Exception e) { return null; }
    }

    private String friendlyType(String t) {
        if (t == null) return "Unknown";
        return switch (t.toUpperCase()) {
            case "PERCENTAGE"   -> "Percentage Discount";
            case "FIXED_AMOUNT" -> "Fixed Amount Discount";
            case "FIXED"        -> "Fixed Discount";
            default             -> t;
        };
    }
}
