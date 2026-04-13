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

        sb.append("NEW USER REGISTRATION\n");
        sb.append("--------------------\n\n");

        sb.append("Status: SUCCESS\n");
        sb.append("A new user account has been successfully registered.\n\n");

        sb.append("USER DETAILS\n");
        sb.append("--------------------\n");
        sb.append("ID: ").append(formatId(user.getId())).append("\n");
        sb.append("Name: ").append(getDisplayName(user, profile)).append("\n");

        if (profile != null && profile.getEmail() != null) {
            sb.append("Email: ").append(profile.getEmail()).append("\n");
        }

        if (profile != null && profile.getPhoneNumber() != null) {
            sb.append("Phone: ").append(profile.getPhoneNumber()).append("\n");
        }

        sb.append("Type: ").append(user.getUserType()).append("\n");
        sb.append("Status: ACTIVE\n");

        sb.append("\nREGISTRATION INFO\n");
        sb.append("--------------------\n");
        sb.append("Date: ").append(formatDateTime(user.getCreatedAt())).append("\n");
        sb.append("Location: Cambodia\n");

        sb.append("\n").append(formatDateTime(LocalDateTime.now())).append("\n");

        return sb.toString();
    }

    private String buildOrderSuccessMessage(Order order) {
        StringBuilder sb = new StringBuilder();

        sb.append("NEW ORDER PLACED\n");
        sb.append("--------------------\n\n");

        sb.append("Status: SUCCESS\n");
        sb.append("Order has been placed and confirmed.\n\n");

        sb.append("ORDER DETAILS\n");
        sb.append("--------------------\n");
        sb.append("Order ID: ").append(formatId(order.getId())).append("\n");
        sb.append("Order #: ").append(order.getOrderNumber()).append("\n");
        sb.append("Customer: ").append(order.getCustomerName() != null ? order.getCustomerName() : "Guest").append("\n");
        sb.append("Total Amount: $").append(order.getTotalAmount()).append("\n");
        sb.append("Items Count: ").append(order.getItems() != null ? order.getItems().size() : 0).append("\n");

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            sb.append("\nITEM LIST\n");
            sb.append("--------------------\n");
            int itemNumber = 1;
            for (OrderItem item : order.getItems()) {
                sb.append(itemNumber).append(". ").append(item.getProductName());
                sb.append(" | Qty: ").append(item.getQuantity());
                sb.append(" | $").append(item.getTotalPrice()).append("\n");
                itemNumber++;
            }
        }

        sb.append("\nORDER INFO\n");
        sb.append("--------------------\n");
        sb.append("Order Status: CONFIRMED\n");
        sb.append("Payment: ").append(order.getPaymentStatus()).append("\n");
        sb.append("Location: Phnom Penh, Cambodia\n");
        sb.append("Date: ").append(formatDateTime(order.getCreatedAt())).append("\n");
        sb.append("Est. Delivery: ").append(formatEstimatedDelivery(order.getCreatedAt())).append("\n");

        sb.append("\n").append(formatDateTime(LocalDateTime.now())).append("\n");

        return sb.toString();
    }

    private String buildOrderStatusChangeMessage(Order order) {
        StringBuilder sb = new StringBuilder();

        sb.append("ORDER STATUS UPDATE\n");
        sb.append("--------------------\n\n");

        sb.append("Status: UPDATED\n");
        sb.append("Order status has been updated.\n\n");

        sb.append("ORDER DETAILS\n");
        sb.append("--------------------\n");
        sb.append("Order ID: ").append(formatId(order.getId())).append("\n");
        sb.append("Order #: ").append(order.getOrderNumber()).append("\n");
        sb.append("Customer: ").append(order.getCustomerName() != null ? order.getCustomerName() : "Guest").append("\n");
        sb.append("Total: $").append(order.getTotalAmount()).append("\n");

        sb.append("\nCURRENT STATUS\n");
        sb.append("--------------------\n");
        sb.append("Order: ").append(order.getOrderStatus()).append("\n");
        sb.append("Payment: ").append(order.getPaymentStatus()).append("\n");
        sb.append("Updated: ").append(formatDateTime(order.getUpdatedAt())).append("\n");

        sb.append("\n").append(formatDateTime(LocalDateTime.now())).append("\n");

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

    private String formatId(Object id) {
        if (id == null) {
            return "N/A";
        }
        String idStr = id.toString();
        if (idStr.length() > 8) {
            return "#" + idStr.substring(0, 8);
        }
        return "#" + idStr;
    }
}
