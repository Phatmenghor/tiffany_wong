package com.tiffany.features.order.repository;

import com.tiffany.features.order.models.OrderCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderCounterRepository extends JpaRepository<OrderCounter, UUID> {

    Optional<OrderCounter> findByCounterDate(LocalDate counterDate);
}
