package com.tiffany.features.notification.service.impl;

import com.tiffany.features.auth.models.User;
import com.tiffany.features.auth.models.UserProfile;
import com.tiffany.features.notification.service.TelegramService;
import com.tiffany.features.order.models.Order;
import com.tiffany.features.order.models.OrderItem;
import com.tiffany.features.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TelegramServiceImpl implements TelegramService {

    private final RestTemplate restTemplate;
    private final OrderRepository orderRepository;

    @Value("${telegram.bot-token}")
    private String botToken;

    @Value("${telegram.group-id}")
    private String groupId;

    @Value("${telegram.enabled:true}")
    private boolean telegramEnabled;

    private static final String TELEGRAM_API_URL = "https://api.telegram.org/bot{token}/sendMessage";
    private static final ZoneId CAMBODIA_ZONE = ZoneId.of("Asia/Phnom_Penh");
    private static final ZoneId UTC_ZONE = ZoneId.of("UTC");
    private static final DateTimeFormatter KH_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Override
    @Async
    public void notifyUserCreated(User user) {
        if (!telegramEnabled) return;
        try {
            String message = buildUserRegistrationMessage(user);
            sendMessage(message);
        } catch (Exception e) {
            log.error("Failed to send user creation notification - userId: {}, error: {}", user.getId(), e.getMessage());
        }
    }

    @Override
    @Async
    public void notifyOrderCreated(Order order) {
        if (!telegramEnabled) return;
        try {
            // Re-fetch inside the async transaction to get fully loaded items
            Order full = orderRepository.findByIdWithDetails(order.getId()).orElse(order);
            String message = buildOrderCreatedMessage(full);
            sendMessage(message);
        } catch (Exception e) {
            log.error("Failed to send order creation notification - orderId: {}, error: {}", order.getId(), e.getMessage());
        }
    }

    @Override
    @Async
    public void notifyOrderStatusChanged(Order order) {
        if (!telegramEnabled) return;
        try {
            Order full = orderRepository.findByIdWithDetails(order.getId()).orElse(order);
            String message = buildOrderStatusChangeMessage(full);
            sendMessage(message);
        } catch (Exception e) {
            log.error("Failed to send order status change notification - orderId: {}, error: {}", order.getId(), e.getMessage());
        }
    }

    // ─── Message builders ───────────────────────────────────────────────────────

    private String buildUserRegistrationMessage(User user) {
        UserProfile profile = user.getProfile();
        StringBuilder sb = new StringBuilder();

        sb.append("NEW USER REGISTRATION\n");
        sb.append("━━━━━━━━━━━━━━━━━━━━━\n\n");

        sb.append("USER INFORMATION\n");
        sb.append("─────────────────\n");
        sb.append("Name: ").append(getDisplayName(user, profile)).append("\n");

        if (profile != null && profile.getEmail() != null) {
            sb.append("Email: ").append(profile.getEmail()).append("\n");
        }
        if (profile != null && profile.getPhoneNumber() != null) {
            sb.append("Phone: ").append(profile.getPhoneNumber()).append("\n");
        }

        sb.append("Type: ").append(user.getUserType()).append("\n");
        sb.append("Registered: ").append(formatKhTime(user.getCreatedAt())).append("\n");

        return sb.toString();
    }

    private String buildOrderCreatedMessage(Order order) {
        StringBuilder sb = new StringBuilder();

        sb.append("NEW ORDER PLACED\n");
        sb.append("━━━━━━━━━━━━━━━━━━━━━\n\n");

        // Order info
        sb.append("ORDER INFORMATION\n");
        sb.append("─────────────────\n");
        sb.append("Order #: ").append(order.getOrderNumber()).append("\n");
        sb.append("Customer: ").append(nvl(order.getCustomerName(), "Guest")).append("\n");
        sb.append("Phone: ").append(nvl(order.getCustomerPhone(), "-")).append("\n");
        if (order.getCustomerNote() != null && !order.getCustomerNote().isBlank()) {
            sb.append("Note: ").append(order.getCustomerNote()).append("\n");
        }
        sb.append("Time: ").append(formatKhTime(order.getCreatedAt())).append("\n");
        sb.append("\n");

        // Items
        List<OrderItem> items = order.getItems();
        int itemCount = items != null ? items.size() : 0;
        sb.append("ITEMS (").append(itemCount).append(")\n");
        sb.append("─────────────────\n");
        if (items != null && !items.isEmpty()) {
            int i = 1;
            for (OrderItem item : items) {
                sb.append(i++).append(". ").append(item.getProductName()).append("\n");
                if (item.getSizeName() != null && !item.getSizeName().equals("Standard")) {
                    sb.append("   Size: ").append(item.getSizeName()).append("\n");
                }
                sb.append("   ").append(formatPrice(item.getFinalPrice()))
                        .append(" x ").append(item.getQuantity())
                        .append(" = ").append(formatPrice(item.getTotalPrice())).append("\n");
                if (Boolean.TRUE.equals(item.getHasPromotion()) && item.getCurrentPrice() != null
                        && item.getCurrentPrice().compareTo(item.getFinalPrice()) > 0) {
                    if (item.getPromotionType() != null && item.getPromotionType().equals("PERCENTAGE")) {
                        sb.append("   Discount: ").append(item.getPromotionValue()).append("% OFF")
                                .append(" (was ").append(formatPrice(item.getCurrentPrice())).append(")\n");
                    } else {
                        sb.append("   Discount: -").append(formatPrice(item.getCurrentPrice().subtract(item.getFinalPrice())))
                                .append(" (was ").append(formatPrice(item.getCurrentPrice())).append(")\n");
                    }
                }
            }
        } else {
            sb.append("No items\n");
        }
        sb.append("\n");

        // Payment summary
        sb.append("PAYMENT SUMMARY\n");
        sb.append("─────────────────\n");
        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("Subtotal: ").append(formatPrice(order.getSubtotal())).append("\n");
            sb.append("Discount: -").append(formatPrice(order.getDiscountAmount())).append("\n");
        }
        sb.append("Total: ").append(formatPrice(order.getTotalAmount())).append("\n");
        sb.append("Method: ").append(nvl(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null, "-")).append("\n");
        sb.append("Payment: ").append(nvl(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null, "-")).append("\n");

        return sb.toString();
    }

    private String buildOrderStatusChangeMessage(Order order) {
        StringBuilder sb = new StringBuilder();

        sb.append("ORDER STATUS UPDATE\n");
        sb.append("━━━━━━━━━━━━━━━━━━━━━\n\n");

        sb.append("ORDER INFORMATION\n");
        sb.append("─────────────────\n");
        sb.append("Order #: ").append(order.getOrderNumber()).append("\n");
        sb.append("Customer: ").append(nvl(order.getCustomerName(), "Guest")).append("\n");
        sb.append("Phone: ").append(nvl(order.getCustomerPhone(), "-")).append("\n");
        sb.append("Updated: ").append(formatKhTime(order.getUpdatedAt())).append("\n");
        sb.append("\n");

        // Items
        List<OrderItem> items = order.getItems();
        if (items != null && !items.isEmpty()) {
            sb.append("ITEMS (").append(items.size()).append(")\n");
            sb.append("─────────────────\n");
            int i = 1;
            for (OrderItem item : items) {
                sb.append(i++).append(". ").append(item.getProductName()).append("\n");
                if (item.getSizeName() != null && !item.getSizeName().equals("Standard")) {
                    sb.append("   Size: ").append(item.getSizeName()).append("\n");
                }
                sb.append("   ").append(formatPrice(item.getFinalPrice()))
                        .append(" x ").append(item.getQuantity())
                        .append(" = ").append(formatPrice(item.getTotalPrice())).append("\n");
            }
            sb.append("\n");
        }

        sb.append("CURRENT STATUS\n");
        sb.append("─────────────────\n");
        sb.append("Order: ").append(order.getOrderStatus()).append("\n");
        sb.append("Payment: ").append(nvl(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null, "-")).append("\n");
        sb.append("Total: ").append(formatPrice(order.getTotalAmount())).append("\n");

        return sb.toString();
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private void sendMessage(String message) {
        try {
            String url = TELEGRAM_API_URL.replace("{token}", botToken);
            Map<String, Object> body = new HashMap<>();
            body.put("chat_id", groupId);
            body.put("text", message);
            restTemplate.postForObject(url, body, String.class);
        } catch (Exception e) {
            log.error("Error sending message to Telegram: {}", e.getMessage());
        }
    }

    /** Convert UTC LocalDateTime stored by JPA to Cambodia time (UTC+7) */
    private String formatKhTime(LocalDateTime utcTime) {
        if (utcTime == null) return "N/A";
        return utcTime.atZone(UTC_ZONE)
                .withZoneSameInstant(CAMBODIA_ZONE)
                .format(KH_FORMATTER);
    }

    private String formatPrice(BigDecimal amount) {
        if (amount == null) return "$0.00";
        return String.format("$%,.2f", amount);
    }

    private String nvl(String value, String fallback) {
        return (value != null && !value.isBlank()) ? value : fallback;
    }

    private String getDisplayName(User user, UserProfile profile) {
        if (profile != null) {
            String fullName = profile.getFullName();
            if (fullName != null && !fullName.isEmpty()) return fullName;
        }
        return user.getUserIdentifier();
    }
}
