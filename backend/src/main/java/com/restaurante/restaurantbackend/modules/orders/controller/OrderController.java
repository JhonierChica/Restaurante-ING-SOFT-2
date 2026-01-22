package com.restaurante.restaurantbackend.modules.orders.controller;

import com.restaurante.restaurantbackend.modules.orders.dto.CreateOrderRequest;
import com.restaurante.restaurantbackend.modules.orders.dto.OrderResponse;
import com.restaurante.restaurantbackend.modules.orders.dto.UpdateOrderRequest;
import com.restaurante.restaurantbackend.modules.orders.model.Order;
import com.restaurante.restaurantbackend.modules.orders.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            OrderResponse response = orderService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            throw new RuntimeException("Error creating order: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) Long tableId) {
        
        if (status != null) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(orderService.getOrdersByStatus(orderStatus));
        }
        
        if (clientId != null) {
            return ResponseEntity.ok(orderService.getOrdersByClient(clientId));
        }
        
        if (tableId != null) {
            return ResponseEntity.ok(orderService.getOrdersByTable(tableId));
        }
        
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        try {
            OrderResponse order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> updateOrder(
            @PathVariable Long id,
            @RequestBody UpdateOrderRequest request) {
        try {
            OrderResponse response = orderService.updateOrder(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            throw new RuntimeException("Error updating order: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
