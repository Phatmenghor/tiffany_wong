package com.emenu.shared.generate;

import com.emenu.features.order.models.OrderCounter;
import com.emenu.features.order.repository.OrderCounterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.function.Predicate;

/**
 * Utility class for generating unique order numbers.
 * Pattern: ORD-YYYYMMDD-XXX where XXX is a database-backed counter per day.
 * Counter grows: 001 → 999 → 1000 → 9999 → 10000 onwards (unlimited).
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class OrderNumberGenerator {

    private final OrderCounterRepository orderCounterRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final String ORDER_PREFIX = "ORD";
    private static final java.util.UUID SYSTEM_BUSINESS_ID = java.util.UUID.fromString("00000000-0000-0000-0000-000000000000");

    /**
     * Generate a unique order number with a counter.
     * Counter is per-day and grows dynamically: 001 → 999 → 1000 → 9999 → 10000 onwards.
     *
     * @return Unique order number in format ORD-YYYYMMDD-XXX (where XXX can be 3, 4, 5+ digits)
     */
    @Transactional
    public String generateOrderNumber() {
        LocalDate today = LocalDate.now();

        // Get or create counter for today's date
        OrderCounter counter = orderCounterRepository.findByBusinessIdAndCounterDate(SYSTEM_BUSINESS_ID, today)
                .orElseGet(() -> {
                    OrderCounter newCounter = new OrderCounter();
                    newCounter.setBusinessId(SYSTEM_BUSINESS_ID);
                    newCounter.setCounterDate(today);
                    newCounter.setCounterValue(0L);
                    return orderCounterRepository.save(newCounter);
                });

        // Increment counter
        counter.setCounterValue(counter.getCounterValue() + 1);
        OrderCounter savedCounter = orderCounterRepository.save(counter);

        String date = today.format(DATE_FORMATTER);
        // Dynamic format: 001-999 (3 digits), 1000-9999 (4 digits), 10000+ (5+ digits)
        return String.format("%s-%s-%03d", ORDER_PREFIX, date, savedCounter.getCounterValue());
    }

    /**
     * Generate a unique order number with uniqueness check.
     *
     * @param existsChecker Predicate to check if order number already exists
     * @return Unique order number in format ORD-YYYYMMDD-XXXXX
     */
    @Transactional
    public String generateUniqueOrderNumber(Predicate<String> existsChecker) {
        String orderNumber = generateOrderNumber();

        // Check if order number exists (should rarely happen with database sequence)
        int attempts = 0;
        final int maxAttempts = 5;

        while (existsChecker.test(orderNumber) && attempts < maxAttempts) {
            orderNumber = generateOrderNumber();
            attempts++;
        }

        if (attempts > 0) {
            log.warn("Had to retry order number generation {} times", attempts);
        }

        log.debug("Generated order number: {}", orderNumber);
        return orderNumber;
    }
}
