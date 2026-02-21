package com.restaurante.restaurantbackend.modules.paymentmethods.repository;

import com.restaurante.restaurantbackend.modules.paymentmethods.model.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    
    Optional<PaymentMethod> findByName(String name);
    
    // Buscar por estado (A=Activo, I=Inactivo) - campo real en BD
    List<PaymentMethod> findByStatus(String status);
}
