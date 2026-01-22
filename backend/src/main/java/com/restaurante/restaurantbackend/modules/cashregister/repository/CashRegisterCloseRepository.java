package com.restaurante.restaurantbackend.modules.cashregister.repository;

import com.restaurante.restaurantbackend.modules.cashregister.model.CashRegisterClose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CashRegisterCloseRepository extends JpaRepository<CashRegisterClose, Long> {
    
    List<CashRegisterClose> findByClosingDateBetweenOrderByClosingDateDesc(
            LocalDateTime startDate, 
            LocalDateTime endDate
    );
    
    List<CashRegisterClose> findByClosedByOrderByClosingDateDesc(String closedBy);
    
    @Query("SELECT c FROM CashRegisterClose c ORDER BY c.closingDate DESC")
    List<CashRegisterClose> findAllOrderByClosingDateDesc();
    
    Optional<CashRegisterClose> findTopByOrderByClosingDateDesc();
}
