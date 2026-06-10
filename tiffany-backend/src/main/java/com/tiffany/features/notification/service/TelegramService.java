package com.tiffany.features.notification.service;

import com.tiffany.features.auth.models.User;

import java.util.UUID;

public interface TelegramService {

    void notifyUserCreated(User user);

    void notifyOrderCreated(UUID orderId);

    void notifyOrderStatusChanged(UUID orderId);
}
