package com.tiffany.features.notification.service;

import com.tiffany.features.auth.models.User;
import com.tiffany.features.order.models.Order;

public interface TelegramService {

    /**
     * Send user registration notification to Telegram group
     */
    void notifyUserCreated(User user);

    /**
     * Send order confirmation notification to Telegram group
     */
    void notifyOrderCreated(Order order);

    /**
     * Send order status update notification to Telegram group
     */
    void notifyOrderStatusChanged(Order order);
}
