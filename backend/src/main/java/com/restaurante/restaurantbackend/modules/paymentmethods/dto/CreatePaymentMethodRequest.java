package com.restaurante.restaurantbackend.modules.paymentmethods.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentMethodRequest {
    private String name;
}
