package com.restaurante.restaurantbackend.modules.payments.repository;

import com.restaurante.restaurantbackend.modules.payments.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByOrderId(Long orderId);
    
    // Buscar por status usando el valor String de la BD (P, C, X, F)
    List<Payment> findByStatus(String status);
    
    List<Payment> findByPaymentMethodId(Long paymentMethodId);
}
