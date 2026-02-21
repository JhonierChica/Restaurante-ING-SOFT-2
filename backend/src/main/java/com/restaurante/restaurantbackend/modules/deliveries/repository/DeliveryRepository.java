package com.restaurante.restaurantbackend.modules.deliveries.repository;

import com.restaurante.restaurantbackend.modules.deliveries.model.Delivery;
import com.restaurante.restaurantbackend.modules.deliveries.model.Delivery.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    
    List<Delivery> findByStatusOrderByCreatedAtDesc(DeliveryStatus status);
    
    List<Delivery> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate, 
            LocalDateTime endDate
    );
    
    @Query("SELECT d FROM Delivery d ORDER BY d.createdAt DESC")
    List<Delivery> findAllOrderByCreatedAtDesc();
    
    Optional<Delivery> findByOrderId(Long orderId);
}
