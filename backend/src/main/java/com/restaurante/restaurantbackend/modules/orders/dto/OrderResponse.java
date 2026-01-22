package com.restaurante.restaurantbackend.modules.orders.dto;

import com.restaurante.restaurantbackend.modules.orders.model.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long clientId;
    private String clientName;
    private Long tableId;
    private Integer tableNumber;
    private Order.OrderStatus status;
    private List<OrderItemResponse> items;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
