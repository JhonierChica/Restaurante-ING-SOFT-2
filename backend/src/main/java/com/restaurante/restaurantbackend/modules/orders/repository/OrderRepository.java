package com.restaurante.restaurantbackend.modules.orders.repository;

import com.restaurante.restaurantbackend.modules.orders.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByStatus(Order.OrderStatus status);
    
    List<Order> findByClientId(Long clientId);
    
    List<Order> findByTableId(Long tableId);
    
    List<Order> findByTableIdAndStatus(Long tableId, Order.OrderStatus status);
}
