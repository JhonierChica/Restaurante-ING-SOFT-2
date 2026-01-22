package com.restaurante.restaurantbackend.modules.cashregister.controller;

import com.restaurante.restaurantbackend.modules.cashregister.dto.CashRegisterCloseResponse;
import com.restaurante.restaurantbackend.modules.cashregister.dto.CreateCashRegisterCloseRequest;
import com.restaurante.restaurantbackend.modules.cashregister.service.CashRegisterCloseService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/cash-register-closes")
@CrossOrigin(origins = "*")
public class CashRegisterCloseController {

    private final CashRegisterCloseService cashRegisterCloseService;

    public CashRegisterCloseController(CashRegisterCloseService cashRegisterCloseService) {
        this.cashRegisterCloseService = cashRegisterCloseService;
    }

    @PostMapping
    public ResponseEntity<CashRegisterCloseResponse> createCashRegisterClose(
            @RequestBody CreateCashRegisterCloseRequest request) {
        try {
            CashRegisterCloseResponse response = cashRegisterCloseService.createCashRegisterClose(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<CashRegisterCloseResponse>> getAllCloses() {
        List<CashRegisterCloseResponse> closes = cashRegisterCloseService.getAllCloses();
        return ResponseEntity.ok(closes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CashRegisterCloseResponse> getCloseById(@PathVariable Long id) {
        try {
            CashRegisterCloseResponse close = cashRegisterCloseService.getCloseById(id);
            return ResponseEntity.ok(close);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/last")
    public ResponseEntity<CashRegisterCloseResponse> getLastClose() {
        try {
            CashRegisterCloseResponse close = cashRegisterCloseService.getLastClose();
            return ResponseEntity.ok(close);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<CashRegisterCloseResponse>> getClosesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<CashRegisterCloseResponse> closes = cashRegisterCloseService.getClosesByDateRange(startDate, endDate);
        return ResponseEntity.ok(closes);
    }

    @GetMapping("/user/{closedBy}")
    public ResponseEntity<List<CashRegisterCloseResponse>> getClosesByUser(@PathVariable String closedBy) {
        List<CashRegisterCloseResponse> closes = cashRegisterCloseService.getClosesByUser(closedBy);
        return ResponseEntity.ok(closes);
    }
}
