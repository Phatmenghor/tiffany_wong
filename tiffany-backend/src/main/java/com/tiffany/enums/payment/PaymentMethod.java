package com.tiffany.enums.payment;

import lombok.Getter;

@Getter
public enum PaymentMethod {
    CASH("Cash Payment"),
    BANK("Bank Payment");

    private final String description;

    PaymentMethod(String description) {
        this.description = description;
    }
}