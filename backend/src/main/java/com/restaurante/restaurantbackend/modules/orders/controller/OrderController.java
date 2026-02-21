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
            // LOG: Ver qué datos llegan
            System.out.println("=== CREATE ORDER REQUEST ===");
            System.out.println("ClientId: " + request.getClientId());
            System.out.println("UserId: " + request.getUserId());
            System.out.println("TableId: " + request.getTableId());
            System.out.println("OrderType: " + request.getOrderType());
            System.out.println("Items count: " + (request.getItems() != null ? request.getItems().size() : 0));
            System.out.println("Notes: " + request.getNotes());
            
            OrderResponse response = orderService.createOrder(request);
            System.out.println("Order created successfully with ID: " + response.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            // LOG: Ver el error específico
            System.err.println("ERROR creating order: " + e.getMessage());
            e.printStackTrace();
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

    @GetMapping("/all-for-payments")
    public ResponseEntity<List<OrderResponse>> getAllOrdersForPayments() {
        // Endpoint específico para el módulo de pagos que incluye TODAS las órdenes
        return ResponseEntity.ok(orderService.getAllOrdersForPayments());
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
