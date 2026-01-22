package com.restaurante.restaurantbackend.modules.cashregister.service;

import com.restaurante.restaurantbackend.modules.cashregister.dto.CashRegisterCloseResponse;
import com.restaurante.restaurantbackend.modules.cashregister.dto.CreateCashRegisterCloseRequest;
import com.restaurante.restaurantbackend.modules.cashregister.model.CashRegisterClose;
import com.restaurante.restaurantbackend.modules.cashregister.repository.CashRegisterCloseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CashRegisterCloseService {

    private final CashRegisterCloseRepository cashRegisterCloseRepository;

    public CashRegisterCloseService(CashRegisterCloseRepository cashRegisterCloseRepository) {
        this.cashRegisterCloseRepository = cashRegisterCloseRepository;
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
