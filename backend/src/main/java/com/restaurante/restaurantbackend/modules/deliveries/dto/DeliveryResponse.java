package com.restaurante.restaurantbackend.modules.deliveries.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryResponse {
    
    private Long id;
    private Long orderId;
    private String clientName;
    private String clientPhone;
    private String deliveryAddress;
    private String addressReference;
    private String neighborhood;
    private String city;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;
    private String status;
    private String deliveryPerson;
    private LocalDateTime assignedAt;
    private LocalDateTime deliveredAt;
    private Integer estimatedTime;
    private String notes;
    private String paymentMethod;
    private String paymentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
