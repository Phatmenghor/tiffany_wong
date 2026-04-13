package com.tiffany.features.notification.service.impl;

import com.tiffany.features.auth.models.User;
import com.tiffany.features.auth.models.UserProfile;
import com.tiffany.features.notification.service.TelegramService;
import com.tiffany.features.order.models.Order;
import com.tiffany.features.order.models.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TelegramServiceImpl implements TelegramService {

    private final RestTemplate restTemplate;

    @Value("${telegram.bot-token}")
    private String botToken;

    @Value("${telegram.group-id}")
    private String groupId;

    @Value("${telegram.enabled:true}")
    private boolean telegramEnabled;

    private static final String TELEGRAM_API_URL = "https://api.telegram.org/bot{token}/sendMessage";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public void notifyUserCreated(User user) {
        if (!telegramEnabled) {
            log.debug("Telegram notifications disabled");
            return;
        }

        try {
            String message = buildUserRegistrationMessage(user);
            sendMessage(message);
            log.info("User creation notification sent - userId: {}", user.getId());
        } catch (Exception e) {
            log.error("Failed to send user creation notification - userId: {}, error: {}", user.getId(), e.getMessage(), e);
        }
    }

    @Override
    public void notifyOrderCreated(Order order) {
        if (!telegramEnabled) {
            log.debug("Telegram notifications disabled");
            return;
        }

        try {
            String message = buildOrderSuccessMessage(order);
            sendMessage(message);
            log.info("Order creation notification sent - orderId: {}", order.getId());
        } catch (Exception e) {
            log.error("Failed to send order creation notification - orderId: {}, error: {}", order.getId(), e.getMessage(), e);
        }
    }

    @Override
    public void notifyOrderStatusChanged(Order order) {
        if (!telegramEnabled) {
            log.debug("Telegram notifications disabled");
            return;
        }

        try {
            String message = buildOrderStatusChangeMessage(order);
            sendMessage(message);
            log.info("Order status change notification sent - orderId: {}", order.getId());
        } catch (Exception e) {
            log.error("Failed to send order status change notification - orderId: {}, error: {}", order.getId(), e.getMessage(), e);
        }
    }

    private String buildUserRegistrationMessage(User user) {
        UserProfile profile = user.getProfile();
        StringBuilder sb = new StringBuilder();

        sb.append("USER REGISTRATION ALERT\n\n");
        sb.append("ID: #").append(user.getId()).append("\n");
        sb.append("Name: ").append(getDisplayName(user, profile)).append("\n");

        if (profile != null && profile.getEmail() != null) {
            sb.append("Email: ").append(profile.getEmail()).append("\n");
        }

        sb.append("User Type: ").append(user.getUserType()).append("\n");

        if (profile != null && profile.getPhoneNumber() != null) {
            sb.append("Phone: ").append(profile.getPhoneNumber()).append("\n");
        }

        sb.append("Location: Cambodia\n");
        sb.append("Registered: ").append(formatDateTime(user.getCreatedAt())).append("\n");

        return sb.toString();
    }

    private String buildOrderSuccessMessage(Order order) {
        StringBuilder sb = new StringBuilder();

        sb.append("ORDER SUCCESS\n\n");
        sb.append("Order #").append(order.getOrderNumber()).append("\n");
        sb.append("Customer: ").append(order.getCustomerName() != null ? order.getCustomerName() : "Guest").append("\n");
        sb.append("Total: $").append(order.getTotalAmount()).append("\n\n");

        sb.append("ITEMS ORDERED:\n");
        sb.append("━━━━━━━━━━━━━━━━━━━━━━\n");

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            int itemNumber = 1;
            for (OrderItem item : order.getItems()) {
                sb.append(itemNumber).append(". ");
                sb.append(item.getProductName()).append(" x");
                sb.append(item.getQuantity()).append(" - $");
                sb.append(item.getTotalPrice()).append("\n");
                itemNumber++;
            }
        }

        sb.append("━━━━━━━━━━━━━━━━━━━━━━\n\n");
        sb.append("Shipping Address: Phnom Penh, Cambodia\n");
        sb.append("Order Date: ").append(formatDateTime(order.getCreatedAt())).append("\n");
        sb.append("Estimated Delivery: ").append(formatEstimatedDelivery(order.getCreatedAt())).append("\n\n");
        sb.append("Status: CONFIRMED\n");
        sb.append("Payment: ").append(order.getPaymentStatus()).append("\n");

        return sb.toString();
    }

    private String buildOrderStatusChangeMessage(Order order) {
        StringBuilder sb = new StringBuilder();

        sb.append("ORDER STATUS UPDATE\n\n");
        sb.append("Order #").append(order.getOrderNumber()).append("\n");
        sb.append("Customer: ").append(order.getCustomerName() != null ? order.getCustomerName() : "Guest").append("\n");
        sb.append("New Status: ").append(order.getOrderStatus()).append("\n");
        sb.append("Total: $").append(order.getTotalAmount()).append("\n");
        sb.append("Updated: ").append(formatDateTime(order.getUpdatedAt())).append("\n");

        return sb.toString();
    }

    private void sendMessage(String message) {
        try {
            String url = TELEGRAM_API_URL.replace("{token}", botToken);

            Map<String, Object> body = new HashMap<>();
            body.put("chat_id", groupId);
            body.put("text", message);
            body.put("parse_mode", "HTML");

            restTemplate.postForObject(url, body, String.class);
            log.debug("Message sent to Telegram group");
        } catch (Exception e) {
            log.error("Error sending message to Telegram: {}", e.getMessage(), e);
            throw e;
        }
    }

    private String getDisplayName(User user, UserProfile profile) {
        if (profile != null) {
            String fullName = profile.getFullName();
            if (fullName != null && !fullName.isEmpty()) {
                return fullName;
            }
        }
        return user.getUserIdentifier();
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "N/A";
        }
        return dateTime.format(DATE_FORMATTER);
    }

    private String formatEstimatedDelivery(LocalDateTime orderDate) {
        if (orderDate == null) {
            return "N/A";
        }
        return orderDate.plusDays(3).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }
}
