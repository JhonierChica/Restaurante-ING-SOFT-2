package com.restaurante.restaurantbackend.modules.paymentmethods.dto;

import com.restaurante.restaurantbackend.modules.paymentmethods.model.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentMethodRequest {
    private String name;
    private PaymentMethod.PaymentType type;
    private String description;
}
