package com.restaurante.restaurantbackend.modules.clients.repository;

import com.restaurante.restaurantbackend.modules.clients.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    
    Optional<Client> findByIdentificationNumber(String identificationNumber);
    
    Optional<Client> findByEmail(String email);
    
    Optional<Client> findByPhone(String phone);
    
    List<Client> findByIsActiveTrue();
    
    List<Client> findByIsFrequentCustomerTrue();
    
    List<Client> findByNameContainingIgnoreCase(String name);
}
