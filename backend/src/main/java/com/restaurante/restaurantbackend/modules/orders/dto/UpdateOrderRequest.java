package com.restaurante.restaurantbackend.modules.orders.dto;

import com.restaurante.restaurantbackend.modules.orders.model.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderRequest {
    private Order.OrderStatus status;
    private List<OrderItemRequest> items;
    private String notes;
}
