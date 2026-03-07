package com.restaurante.restaurantbackend.modules.payments.service;

import com.restaurante.restaurantbackend.modules.cashregister.model.CashRegisterClose;
import com.restaurante.restaurantbackend.modules.cashregister.repository.CashRegisterCloseRepository;
import com.restaurante.restaurantbackend.modules.orders.model.Order;
import com.restaurante.restaurantbackend.modules.orders.repository.OrderRepository;
import com.restaurante.restaurantbackend.modules.paymentmethods.model.PaymentMethod;
import com.restaurante.restaurantbackend.modules.paymentmethods.repository.PaymentMethodRepository;
import com.restaurante.restaurantbackend.modules.payments.dto.CreatePaymentRequest;
import com.restaurante.restaurantbackend.modules.payments.dto.PaymentResponse;
import com.restaurante.restaurantbackend.modules.payments.dto.UpdatePaymentRequest;
import com.restaurante.restaurantbackend.modules.payments.model.Payment;
import com.restaurante.restaurantbackend.modules.payments.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final CashRegisterCloseRepository cashRegisterCloseRepository;

    public PaymentService(PaymentRepository paymentRepository,
                         OrderRepository orderRepository,
                         PaymentMethodRepository paymentMethodRepository,
                         CashRegisterCloseRepository cashRegisterCloseRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.cashRegisterCloseRepository = cashRegisterCloseRepository;
    }

    public PaymentResponse createPayment(CreatePaymentRequest request) {
        // Validar que el pedido existe
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + request.getOrderId()));

        // Validar que el método de pago existe
        PaymentMethod paymentMethod = paymentMethodRepository.findById(request.getPaymentMethodId())
                .orElseThrow(() -> new RuntimeException("Payment method not found with id: " + request.getPaymentMethodId()));

        // Validar que el método de pago está activo
        if (!paymentMethod.getIsActive()) {
            throw new RuntimeException("Payment method is not active: " + paymentMethod.getName());
        }

        // Crear el pago
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(paymentMethod);
        payment.setAmountFromBigDecimal(request.getAmount());
        payment.setPaymentStatus(Payment.PaymentStatus.COMPLETADO);

        Payment savedPayment = paymentRepository.save(payment);
        return mapToResponse(savedPayment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Devuelve solo los pagos completados del día actual que aún no han sido incluidos
     * en un cierre de caja. Si ya se hizo cierre hoy, devuelve lista vacía.
     */
    @Transactional(readOnly = true)
    public List<PaymentResponse> getUnclosedPayments() {
        LocalDate today = LocalDate.now();

        // Buscar el último cierre de caja
        Optional<CashRegisterClose> lastCloseOpt = cashRegisterCloseRepository.findTopByOrderByClosingDateDesc();

        if (lastCloseOpt.isPresent()) {
            CashRegisterClose lastClose = lastCloseOpt.get();
            LocalDate lastCloseDate = lastClose.getClosingDate().toLocalDate();

            // Si el último cierre fue hoy, ya no hay pagos pendientes de cierre
            if (lastCloseDate.equals(today)) {
                return List.of();
            }

            // Devolver pagos con fecha posterior al cierre
            return paymentRepository.findByPaymentDateGreaterThan(lastCloseDate).stream()
                    .filter(p -> "C".equals(p.getStatus()))
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // Si no hay cierres previos, devolver todos los pagos completados de hoy
        return paymentRepository.findByPaymentDate(today).stream()
                .filter(p -> "C".equals(p.getStatus()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByOrder(Long orderId) {
        return paymentRepository.findByOrderId(orderId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByStatus(Payment.PaymentStatus status) {
        // Convertir el enum a String para buscar en BD
        String statusCode = "";
        switch (status) {
            case COMPLETADO: statusCode = "C"; break;
            case CANCELADO: statusCode = "X"; break;
            case FALLIDO: statusCode = "F"; break;
            default: statusCode = "P";
        }
        return paymentRepository.findByStatus(statusCode).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByPaymentMethod(Long paymentMethodId) {
        return paymentRepository.findByPaymentMethodId(paymentMethodId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        return mapToResponse(payment);
    }

    public PaymentResponse updatePayment(Long id, UpdatePaymentRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));

        if (request.getAmount() != null) {
            payment.setAmountFromBigDecimal(request.getAmount());
        }

        if (request.getStatus() != null) {
            payment.setPaymentStatus(request.getStatus());
        }

        Payment updatedPayment = paymentRepository.save(payment);
        return mapToResponse(updatedPayment);
    }

    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        paymentRepository.delete(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setOrderId(payment.getOrder().getId());
        response.setPaymentMethodId(payment.getPaymentMethod().getId());
        response.setPaymentMethodName(payment.getPaymentMethod().getName());
        response.setAmount(payment.getAmountAsBigDecimal());
        response.setStatus(payment.getPaymentStatus());
        response.setPaymentDate(payment.getPaymentDate());
        return response;
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        return paymentRepository.findByPaymentDateBetween(startDate, endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public java.math.BigDecimal getTotalSalesByDate(java.time.LocalDate date) {
        List<Payment> payments = paymentRepository.findByPaymentDate(date);
        return payments.stream()
                .filter(p -> "C".equals(p.getStatus())) // Solo pagos completados
                .map(Payment::getAmountAsBigDecimal)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public int countPaymentsByDate(java.time.LocalDate date) {
        return paymentRepository.countByPaymentDateAndStatus(date, "C");
    }
}
