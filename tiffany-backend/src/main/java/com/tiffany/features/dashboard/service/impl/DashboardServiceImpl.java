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
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    @PersistenceContext
    private EntityManager em;

    @Override
    public DashboardSummaryResponse getSummary(String period) {
        log.info("Dashboard summary query: period={}", period);

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

        log.info("Dashboard summary result: todaySales={}, todayOrders={}, pendingOrders={}, avgOrderValue={}",
                salesToday, ordersToday, pendingOrders, avg);

        return DashboardSummaryResponse.builder()
            .totalSalesToday(salesToday)
            .totalOrdersToday(ordersToday)
            .totalSalesChange(DashboardPeriodUtil.percentageChange(
                salesToday.doubleValue(), salesYesterday.doubleValue()))
            .totalOrdersChange(DashboardPeriodUtil.percentageChange(
                (double) ordersToday, (double) ordersYesterday))
            .systemAlerts(pendingOrders)
            .avgOrderValue(avg)
            .build();
    }

    @Override
    public DashboardSalesResponse getSales(String period) {
        log.info("Dashboard sales query: period={}", period);

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

        log.info("Dashboard sales result: period={}, dataPoints={}, totalRevenue={}, totalOrders={}",
                period, points.size(), totalRevenue, totalOrders);

        return DashboardSalesResponse.builder()
            .data(points).totalRevenue(totalRevenue)
            .totalOrders(totalOrders).period(period).build();
    }

    @Override
    public DashboardPaymentsResponse getPayments(String period) {
        log.info("Dashboard payments query: period={}", period);

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

        log.info("Dashboard payments result: period={}, methods={}, totalAmount={}, totalCount={}",
                period, items.size(), totalAmount, totalCount);

        return DashboardPaymentsResponse.builder()
            .data(items).totalAmount(totalAmount).totalCount(totalCount).build();
    }

    @Override
    public DashboardHourlySalesResponse getHourlySales(String period) {
        log.info("Dashboard hourly-sales query: period={}", period);

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

        log.info("Dashboard hourly-sales result: period={}, peakHour={}, peakRevenue={}, currentHour={}",
                period, peakHour, peakRev, nowHour);

        return DashboardHourlySalesResponse.builder()
            .data(points).peakHour(peakHour).currentHour(nowHour).build();
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
}
