package com.tiffany.features.order.repository;

import com.tiffany.features.order.models.OrderDeliveryOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderDeliveryOptionRepository extends JpaRepository<OrderDeliveryOption, UUID> {

    /**
     * Find delivery option by order ID
     */
    Optional<OrderDeliveryOption> findByOrderId(UUID orderId);
}
