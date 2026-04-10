package com.tiffany.enums.product;

import lombok.Getter;

@Getter
public enum ProductStatus {
    ACTIVE("Active - Available for customers"),
    INACTIVE("Inactive - Hidden from customers");

    private final String description;

    ProductStatus(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return this == ACTIVE;
    }

    public boolean isAvailable() {
        return this == ACTIVE;
    }
}