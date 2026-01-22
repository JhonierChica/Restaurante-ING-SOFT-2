package com.restaurante.restaurantbackend.modules.deliveries.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDeliveryRequest {
    
    private Long orderId;
    private String clientName;
    private String clientPhone;
    private String deliveryAddress;
    private String addressReference;
    private String neighborhood;
    private String city;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;
    private String deliveryPerson;
    private Integer estimatedTime;
    private String notes;
    private String paymentMethod;
    private String paymentStatus;
}
