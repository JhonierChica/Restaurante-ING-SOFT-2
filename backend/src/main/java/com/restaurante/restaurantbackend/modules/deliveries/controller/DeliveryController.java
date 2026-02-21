package com.restaurante.restaurantbackend.modules.deliveries.controller;

import com.restaurante.restaurantbackend.modules.deliveries.dto.CreateDeliveryRequest;
import com.restaurante.restaurantbackend.modules.deliveries.dto.DeliveryResponse;
import com.restaurante.restaurantbackend.modules.deliveries.dto.UpdateDeliveryStatusRequest;
import com.restaurante.restaurantbackend.modules.deliveries.service.DeliveryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "*")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @PostMapping
    public ResponseEntity<DeliveryResponse> createDelivery(@RequestBody CreateDeliveryRequest request) {
        try {
            DeliveryResponse response = deliveryService.createDelivery(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<DeliveryResponse>> getAllDeliveries(
            @RequestParam(required = false) Boolean activeOnly) {
        try {
            System.out.println("[DeliveryController] GET /api/deliveries - activeOnly: " + activeOnly);
            List<DeliveryResponse> deliveries;
            
            if (activeOnly != null && activeOnly) {
                System.out.println("[DeliveryController] Fetching active deliveries only");
                deliveries = deliveryService.getActiveDeliveries();
            } else {
                System.out.println("[DeliveryController] Fetching all deliveries");
                deliveries = deliveryService.getAllDeliveries();
            }
            
            System.out.println("[DeliveryController] Successfully fetched " + deliveries.size() + " deliveries");
            return ResponseEntity.ok(deliveries);
        } catch (Exception e) {
            System.err.println("[DeliveryController] ERROR getting deliveries: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryResponse> getDeliveryById(@PathVariable Long id) {
        try {
            DeliveryResponse delivery = deliveryService.getDeliveryById(id);
            return ResponseEntity.ok(delivery);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<DeliveryResponse>> getDeliveriesByStatus(@PathVariable String status) {
        try {
            List<DeliveryResponse> deliveries = deliveryService.getDeliveriesByStatus(status);
            return ResponseEntity.ok(deliveries);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<DeliveryResponse>> getDeliveriesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<DeliveryResponse> deliveries = deliveryService.getDeliveriesByDateRange(startDate, endDate);
        return ResponseEntity.ok(deliveries);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<DeliveryResponse> getDeliveryByOrderId(@PathVariable Long orderId) {
        try {
            DeliveryResponse delivery = deliveryService.getDeliveryByOrderId(orderId);
            return ResponseEntity.ok(delivery);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DeliveryResponse> updateDeliveryStatus(
            @PathVariable Long id,
            @RequestBody UpdateDeliveryStatusRequest request) {
        try {
            DeliveryResponse delivery = deliveryService.updateDeliveryStatus(id, request);
            return ResponseEntity.ok(delivery);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<DeliveryResponse> updateDeliveryStatusPut(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusMap) {
        try {
            UpdateDeliveryStatusRequest request = new UpdateDeliveryStatusRequest();
            request.setStatus(statusMap.get("status"));
            DeliveryResponse delivery = deliveryService.updateDeliveryStatus(id, request);
            return ResponseEntity.ok(delivery);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
