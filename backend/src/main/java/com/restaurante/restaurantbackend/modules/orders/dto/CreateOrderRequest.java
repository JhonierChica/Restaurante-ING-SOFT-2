package com.restaurante.restaurantbackend.modules.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    private Long clientId;
    private Long tableId;
    private List<OrderItemRequest> items;
    private String notes;
}
