package com.restaurante.restaurantbackend.modules.payments.dto;

import com.restaurante.restaurantbackend.modules.payments.model.Payment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private Long paymentMethodId;
    private String paymentMethodName;
    private BigDecimal amount;
    private Payment.PaymentStatus status;
    private LocalDate paymentDate;
}
