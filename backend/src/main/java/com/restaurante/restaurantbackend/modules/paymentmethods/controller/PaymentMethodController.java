package com.restaurante.restaurantbackend.modules.paymentmethods.controller;

import com.restaurante.restaurantbackend.modules.paymentmethods.dto.CreatePaymentMethodRequest;
import com.restaurante.restaurantbackend.modules.paymentmethods.dto.PaymentMethodResponse;
import com.restaurante.restaurantbackend.modules.paymentmethods.dto.UpdatePaymentMethodRequest;
import com.restaurante.restaurantbackend.modules.paymentmethods.service.PaymentMethodService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-methods")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    public PaymentMethodController(PaymentMethodService paymentMethodService) {
        this.paymentMethodService = paymentMethodService;
    }

    @PostMapping
    public ResponseEntity<PaymentMethodResponse> createPaymentMethod(@RequestBody CreatePaymentMethodRequest request) {
        try {
            PaymentMethodResponse response = paymentMethodService.createPaymentMethod(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            throw new RuntimeException("Error creating payment method: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<PaymentMethodResponse>> getAllPaymentMethods(
            @RequestParam(required = false) Boolean activeOnly) {
        
        List<PaymentMethodResponse> paymentMethods = activeOnly != null && activeOnly
                ? paymentMethodService.getActivePaymentMethods()
                : paymentMethodService.getAllPaymentMethods();
        return ResponseEntity.ok(paymentMethods);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentMethodResponse> getPaymentMethodById(@PathVariable Long id) {
        try {
            PaymentMethodResponse paymentMethod = paymentMethodService.getPaymentMethodById(id);
            return ResponseEntity.ok(paymentMethod);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentMethodResponse> updatePaymentMethod(
            @PathVariable Long id,
            @RequestBody UpdatePaymentMethodRequest request) {
        try {
            PaymentMethodResponse response = paymentMethodService.updatePaymentMethod(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            throw new RuntimeException("Error updating payment method: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentMethod(@PathVariable Long id) {
        try {
            paymentMethodService.deletePaymentMethod(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<PaymentMethodResponse> togglePaymentMethodStatus(@PathVariable Long id) {
        try {
            PaymentMethodResponse response = paymentMethodService.togglePaymentMethodStatus(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
