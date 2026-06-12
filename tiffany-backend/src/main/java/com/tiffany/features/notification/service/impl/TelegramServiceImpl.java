package com.tiffany.features.notification.service.impl;

import com.tiffany.features.auth.models.User;
import com.tiffany.features.auth.models.UserProfile;
import com.tiffany.features.notification.service.TelegramService;
import com.tiffany.features.order.models.Order;
import com.tiffany.features.order.models.OrderDeliveryAddress;
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
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
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
    private static final String SEP = "────────────────────";
    private static final DateTimeFormatter KH_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Override
    @Async
    public void notifyUserCreated(User user) {
        if (!telegramEnabled) return;
        try {
            sendMessage(buildUserRegistrationMessage(user));
        } catch (Exception e) {
            log.error("Failed to send user creation notification - userId: {}, error: {}", user.getId(), e.getMessage());
        }
    }

    @Override
    @Async
    @Transactional(readOnly = true)
    public void notifyOrderCreated(UUID orderId) {
        if (!telegramEnabled) return;
        try {
            Order order = orderRepository.findByIdWithDetails(orderId).orElse(null);
            if (order == null) {
                log.warn("Order not found for Telegram notification - orderId: {}", orderId);
                return;
            }
            sendMessage(buildOrderCreatedMessage(order));
        } catch (Exception e) {
            log.error("Failed to send order creation notification - orderId: {}, error: {}", orderId, e.getMessage());
        }
    }

    @Override
    @Async
    @Transactional(readOnly = true)
    public void notifyOrderStatusChanged(UUID orderId) {
        if (!telegramEnabled) return;
        try {
            Order order = orderRepository.findByIdWithDetails(orderId).orElse(null);
            if (order == null) {
                log.warn("Order not found for Telegram status notification - orderId: {}", orderId);
                return;
            }
            sendMessage(buildOrderStatusChangeMessage(order));
        } catch (Exception e) {
            log.error("Failed to send order status change notification - orderId: {}, error: {}", orderId, e.getMessage());
        }
    }

    // ─── Message builders ───────────────────────────────────────────────────────

    private String buildUserRegistrationMessage(User user) {
        UserProfile profile = user.getProfile();
        StringBuilder sb = new StringBuilder();

        sb.append("NEW USER REGISTRATION\n");
        sb.append(SEP).append("\n");
        sb.append("Name: ").append(getDisplayName(user, profile)).append("\n");
        if (profile != null && profile.getEmail() != null) {
            sb.append("Email: ").append(profile.getEmail()).append("\n");
        }
        if (profile != null && profile.getPhoneNumber() != null) {
            sb.append("Phone: ").append(profile.getPhoneNumber()).append("\n");
        }
        sb.append("Type: ").append(user.getUserType()).append("\n");
        sb.append(SEP).append("\n");
        sb.append("Time: ").append(formatKhTime(user.getCreatedAt())).append("\n");

        return sb.toString();
    }

    private String buildOrderCreatedMessage(Order order) {
        StringBuilder sb = new StringBuilder();

        sb.append("NEW ORDER PLACED\n");
        sb.append(SEP).append("\n");
        sb.append("Order #: ").append(order.getOrderNumber()).append("\n");
        sb.append("Customer: ").append(nvl(order.getCustomerName(), "Guest")).append("\n");
        sb.append("Phone: ").append(nvl(order.getCustomerPhone(), "-")).append("\n");
        sb.append("Delivery: ").append(formatDeliveryAddress(order.getDeliveryAddress())).append("\n");
        if (order.getCustomerNote() != null && !order.getCustomerNote().isBlank()) {
            sb.append("Note: ").append(order.getCustomerNote()).append("\n");
        }
        sb.append("Time: ").append(formatKhTime(order.getCreatedAt())).append("\n");

        // Items
        List<OrderItem> items = order.getItems();
        int itemCount = items != null ? items.size() : 0;
        sb.append(SEP).append("\n");
        sb.append("ITEMS (").append(itemCount).append(")\n");
        if (items != null && !items.isEmpty()) {
            for (int i = 0; i < items.size(); i++) {
                OrderItem item = items.get(i);
                sb.append(i + 1).append(". ").append(item.getProductName()).append("\n");
                String size = item.getSizeName();
                if (size != null && !size.equals("Standard")) {
                    sb.append("   Size: ").append(size).append("\n");
                }
                sb.append("   ").append(formatPrice(item.getFinalPrice()))
                        .append(" x ").append(item.getQuantity())
                        .append(" = ").append(formatPrice(item.getTotalPrice())).append("\n");
                if (Boolean.TRUE.equals(item.getHasPromotion())
                        && item.getCurrentPrice() != null
                        && item.getCurrentPrice().compareTo(item.getFinalPrice()) > 0) {
                    if ("PERCENTAGE".equals(item.getPromotionType())) {
                        sb.append("   ").append(item.getPromotionValue()).append("% OFF")
                                .append(" (was ").append(formatPrice(item.getCurrentPrice())).append(")\n");
                    } else {
                        sb.append("   -").append(formatPrice(item.getCurrentPrice().subtract(item.getFinalPrice())))
                                .append(" OFF (was ").append(formatPrice(item.getCurrentPrice())).append(")\n");
                    }
                }
            }
        }

        // Payment
        sb.append(SEP).append("\n");
        sb.append("PAYMENT\n");
        sb.append("Method: ").append(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "-").append("\n");
        sb.append("Status: ").append(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : "-").append("\n");
        sb.append("Total: ").append(formatPrice(order.getTotalAmount()));
        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append(" (Saved ").append(formatPrice(order.getDiscountAmount())).append(")");
        }
        sb.append("\n");

        return sb.toString();
    }

    private String buildOrderStatusChangeMessage(Order order) {
        StringBuilder sb = new StringBuilder();

        sb.append("ORDER STATUS UPDATE\n");
        sb.append(SEP).append("\n");
        sb.append("Order #: ").append(order.getOrderNumber()).append("\n");
        sb.append("Customer: ").append(nvl(order.getCustomerName(), "Guest")).append("\n");
        sb.append("Phone: ").append(nvl(order.getCustomerPhone(), "-")).append("\n");
        sb.append("Delivery: ").append(formatDeliveryAddress(order.getDeliveryAddress())).append("\n");
        sb.append("Updated: ").append(formatKhTime(order.getUpdatedAt())).append("\n");

        // Items
        List<OrderItem> items = order.getItems();
        if (items != null && !items.isEmpty()) {
            sb.append(SEP).append("\n");
            sb.append("ITEMS (").append(items.size()).append(")\n");
            for (int i = 0; i < items.size(); i++) {
                OrderItem item = items.get(i);
                sb.append(i + 1).append(". ").append(item.getProductName()).append("\n");
                String size = item.getSizeName();
                if (size != null && !size.equals("Standard")) {
                    sb.append("   Size: ").append(size).append("\n");
                }
                sb.append("   ").append(formatPrice(item.getFinalPrice()))
                        .append(" x ").append(item.getQuantity())
                        .append(" = ").append(formatPrice(item.getTotalPrice())).append("\n");
            }
        }

        sb.append(SEP).append("\n");
        sb.append("STATUS\n");
        sb.append("Order: ").append(order.getOrderStatus()).append("\n");
        sb.append("Payment: ").append(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : "-").append("\n");
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

    private String formatDeliveryAddress(OrderDeliveryAddress addr) {
        if (addr == null) return "Pickup";
        StringBuilder sb = new StringBuilder();
        if (addr.getHouseNumber() != null) sb.append(addr.getHouseNumber()).append(", ");
        if (addr.getStreetNumber() != null) sb.append(addr.getStreetNumber()).append(", ");
        if (addr.getVillage() != null) sb.append(addr.getVillage()).append(", ");
        if (addr.getCommune() != null) sb.append(addr.getCommune()).append(", ");
        if (addr.getDistrict() != null) sb.append(addr.getDistrict()).append(", ");
        if (addr.getProvince() != null) sb.append(addr.getProvince());
        String result = sb.toString().trim().replaceAll(",\\s*$", "");
        return result.isEmpty() ? "Pickup" : result;
    }

    private String formatKhTime(LocalDateTime time) {
        if (time == null) return "N/A";
        return time.format(KH_FORMATTER);
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
