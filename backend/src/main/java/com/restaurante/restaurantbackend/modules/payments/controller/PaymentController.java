package com.restaurante.restaurantbackend.modules.payments.controller;

import com.restaurante.restaurantbackend.modules.payments.dto.CreatePaymentRequest;
import com.restaurante.restaurantbackend.modules.payments.dto.PaymentResponse;
import com.restaurante.restaurantbackend.modules.payments.dto.UpdatePaymentRequest;
import com.restaurante.restaurantbackend.modules.payments.model.Payment;
import com.restaurante.restaurantbackend.modules.payments.service.PaymentService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody CreatePaymentRequest request) {
        try {
            PaymentResponse response = paymentService.createPayment(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            throw new RuntimeException("Error creating payment: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments(
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long paymentMethodId) {
        
        if (orderId != null) {
            return ResponseEntity.ok(paymentService.getPaymentsByOrder(orderId));
        }
        
        if (status != null) {
            Payment.PaymentStatus paymentStatus = Payment.PaymentStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(paymentService.getPaymentsByStatus(paymentStatus));
        }
        
        if (paymentMethodId != null) {
            return ResponseEntity.ok(paymentService.getPaymentsByPaymentMethod(paymentMethodId));
        }
        
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/unclosed")
    public ResponseEntity<List<PaymentResponse>> getUnclosedPayments() {
        return ResponseEntity.ok(paymentService.getUnclosedPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        try {
            PaymentResponse payment = paymentService.getPaymentById(id);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(paymentService.getPaymentsByDateRange(startDate, endDate));
    }

    @GetMapping("/daily-summary")
    public ResponseEntity<Map<String, Object>> getDailySummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("date", date);
        summary.put("totalSales", paymentService.getTotalSalesByDate(date));
        summary.put("totalTransactions", paymentService.countPaymentsByDate(date));
        return ResponseEntity.ok(summary);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentResponse> updatePayment(
            @PathVariable Long id,
            @RequestBody UpdatePaymentRequest request) {
        try {
            PaymentResponse response = paymentService.updatePayment(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            throw new RuntimeException("Error updating payment: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        try {
            paymentService.deletePayment(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
