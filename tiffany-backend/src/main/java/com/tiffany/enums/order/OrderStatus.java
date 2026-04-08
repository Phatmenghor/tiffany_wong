package com.tiffany.enums.order;

import lombok.Getter;

@Getter
public enum OrderStatus {
    PENDING("Pending", "Order placed, awaiting confirmation"),
    CONFIRMED("Confirmed", "Order confirmed"),
    COMPLETED("Completed", "Order delivered/completed"),
    CANCELLED("Cancelled", "Order cancelled");

    private final String displayName;
    private final String description;

    OrderStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public boolean isPending() {
        return this == PENDING;
    }

    public boolean isConfirmed() {
        return this == CONFIRMED;
    }

    public boolean isCompleted() {
        return this == COMPLETED;
    }

    public boolean isCancelled() {
        return this == CANCELLED;
    }

    public boolean isActive() {
        return this != CANCELLED && this != COMPLETED;
    }

    public boolean isTerminal() {
        return this == COMPLETED || this == CANCELLED;
    }
}
