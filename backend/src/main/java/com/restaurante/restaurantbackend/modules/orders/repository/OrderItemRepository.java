package com.restaurante.restaurantbackend.modules.orders.repository;

import com.restaurante.restaurantbackend.modules.orders.model.OrderItem;
import com.restaurante.restaurantbackend.modules.orders.model.OrderItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, OrderItemId> {
    
    List<OrderItem> findByOrderId(Long orderId);
}
