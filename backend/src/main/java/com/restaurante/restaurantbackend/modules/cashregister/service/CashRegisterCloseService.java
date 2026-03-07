package com.restaurante.restaurantbackend.modules.cashregister.service;

import com.restaurante.restaurantbackend.modules.cashregister.dto.CashRegisterCloseResponse;
import com.restaurante.restaurantbackend.modules.cashregister.dto.CreateCashRegisterCloseRequest;
import com.restaurante.restaurantbackend.modules.cashregister.model.CashRegisterClose;
import com.restaurante.restaurantbackend.modules.cashregister.repository.CashRegisterCloseRepository;
import com.restaurante.restaurantbackend.modules.payments.model.Payment;
import com.restaurante.restaurantbackend.modules.payments.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CashRegisterCloseService {

    private static final Logger log = LoggerFactory.getLogger(CashRegisterCloseService.class);

    private final CashRegisterCloseRepository cashRegisterCloseRepository;
    private final PaymentRepository paymentRepository;

    public CashRegisterCloseService(CashRegisterCloseRepository cashRegisterCloseRepository,
                                     PaymentRepository paymentRepository) {
        this.cashRegisterCloseRepository = cashRegisterCloseRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public CashRegisterCloseResponse createDailyCashClose(String closedBy) {
        LocalDate today = LocalDate.now();
        
        // Verificar si ya existe un cierre para hoy
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        List<CashRegisterClose> existingCloses = cashRegisterCloseRepository
                .findByClosingDateBetweenOrderByClosingDateDesc(startOfDay, endOfDay);
        if (!existingCloses.isEmpty()) {
            throw new RuntimeException("Ya existe un cierre de caja para el día de hoy");
        }

        // Obtener pagos del día
        List<Payment> todayPayments = paymentRepository.findByPaymentDate(today);
        List<Payment> completedPayments = todayPayments.stream()
                .filter(p -> "C".equals(p.getStatus()))
                .collect(Collectors.toList());

        BigDecimal totalSales = completedPayments.stream()
                .map(Payment::getAmountAsBigDecimal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalTransactions = completedPayments.size();

        // Obtener monto inicial del último cierre
        BigDecimal initialAmount = BigDecimal.ZERO;
        try {
            CashRegisterClose lastClose = cashRegisterCloseRepository
                    .findTopByOrderByClosingDateDesc().orElse(null);
            if (lastClose != null) {
                initialAmount = lastClose.getFinalAmount();
            }
        } catch (Exception e) {
            log.warn("No previous cash register closes found, using initial amount of 0: {}", e.getMessage());
        }

        BigDecimal finalAmount = initialAmount.add(totalSales);
        BigDecimal expectedAmount = initialAmount.add(totalSales);
        BigDecimal difference = finalAmount.subtract(expectedAmount);

        CashRegisterClose close = new CashRegisterClose();
        close.setOpeningDate(startOfDay);
        close.setClosingDate(LocalDateTime.now());
        close.setInitialAmount(initialAmount);
        close.setFinalAmount(finalAmount);
        close.setExpectedAmount(expectedAmount);
        close.setDifference(difference);
        close.setTotalSales(totalSales);
        close.setTotalTransactions(totalTransactions);
        close.setCashAmount(totalSales); // Por defecto todo como efectivo
        close.setCardAmount(BigDecimal.ZERO);
        close.setOtherAmount(BigDecimal.ZERO);
        close.setClosedBy(closedBy);
        close.setNotes("Cierre de caja del día " + today);

        CashRegisterClose savedClose = cashRegisterCloseRepository.save(close);
        return mapToResponse(savedClose);
    }

    @Transactional
    public CashRegisterCloseResponse createCashRegisterClose(CreateCashRegisterCloseRequest request) {
        CashRegisterClose close = new CashRegisterClose();
        close.setOpeningDate(request.getOpeningDate() != null ? request.getOpeningDate() : LocalDateTime.now());
        close.setClosingDate(request.getClosingDate() != null ? request.getClosingDate() : LocalDateTime.now());
        close.setInitialAmount(request.getInitialAmount() != null ? request.getInitialAmount() : BigDecimal.ZERO);
        close.setFinalAmount(request.getFinalAmount() != null ? request.getFinalAmount() : BigDecimal.ZERO);
        close.setExpectedAmount(request.getExpectedAmount() != null ? request.getExpectedAmount() : BigDecimal.ZERO);
        
        // Calcular diferencia
        BigDecimal difference = close.getFinalAmount().subtract(close.getExpectedAmount());
        close.setDifference(difference);
        
        close.setTotalSales(request.getTotalSales() != null ? request.getTotalSales() : BigDecimal.ZERO);
        close.setTotalTransactions(request.getTotalTransactions() != null ? request.getTotalTransactions() : 0);
        close.setCashAmount(request.getCashAmount() != null ? request.getCashAmount() : BigDecimal.ZERO);
        close.setCardAmount(request.getCardAmount() != null ? request.getCardAmount() : BigDecimal.ZERO);
        close.setOtherAmount(request.getOtherAmount() != null ? request.getOtherAmount() : BigDecimal.ZERO);
        close.setClosedBy(request.getClosedBy());
        close.setNotes(request.getNotes());

        CashRegisterClose savedClose = cashRegisterCloseRepository.save(close);
        return mapToResponse(savedClose);
    }

    @Transactional(readOnly = true)
    public List<CashRegisterCloseResponse> getAllCloses() {
        return cashRegisterCloseRepository.findAllOrderByClosingDateDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CashRegisterCloseResponse getCloseById(Long id) {
        CashRegisterClose close = cashRegisterCloseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cierre de caja no encontrado con id: " + id));
        return mapToResponse(close);
    }

    @Transactional(readOnly = true)
    public List<CashRegisterCloseResponse> getClosesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return cashRegisterCloseRepository.findByClosingDateBetweenOrderByClosingDateDesc(startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CashRegisterCloseResponse> getClosesByUser(String closedBy) {
        return cashRegisterCloseRepository.findByClosedByOrderByClosingDateDesc(closedBy)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CashRegisterCloseResponse getLastClose() {
        CashRegisterClose close = cashRegisterCloseRepository.findTopByOrderByClosingDateDesc()
                .orElseThrow(() -> new RuntimeException("No se encontraron cierres de caja"));
        return mapToResponse(close);
    }

    private CashRegisterCloseResponse mapToResponse(CashRegisterClose close) {
        CashRegisterCloseResponse response = new CashRegisterCloseResponse();
        response.setId(close.getId());
        response.setOpeningDate(close.getOpeningDate());
        response.setClosingDate(close.getClosingDate());
        response.setInitialAmount(close.getInitialAmount());
        response.setFinalAmount(close.getFinalAmount());
        response.setExpectedAmount(close.getExpectedAmount());
        response.setDifference(close.getDifference());
        response.setTotalSales(close.getTotalSales());
        response.setTotalTransactions(close.getTotalTransactions());
        response.setCashAmount(close.getCashAmount());
        response.setCardAmount(close.getCardAmount());
        response.setOtherAmount(close.getOtherAmount());
        response.setClosedBy(close.getClosedBy());
        response.setNotes(close.getNotes());
        response.setCreatedAt(close.getCreatedAt());
        return response;
    }
}
