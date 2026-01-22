package com.restaurante.restaurantbackend.modules.payments.repository;

import com.restaurante.restaurantbackend.modules.payments.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByOrderId(Long orderId);
    
    List<Payment> findByStatus(Payment.PaymentStatus status);
    
    List<Payment> findByPaymentMethodId(Long paymentMethodId);
    
    Optional<Payment> findByReferenceNumber(String referenceNumber);
}
