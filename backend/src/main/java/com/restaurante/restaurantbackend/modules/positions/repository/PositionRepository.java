package com.restaurante.restaurantbackend.modules.positions.repository;

import com.restaurante.restaurantbackend.modules.positions.model.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {
    
    Optional<Position> findByCode(String code);
    
    List<Position> findByDepartment(String department);
    
    @Query("SELECT p FROM Position p WHERE p.status = 'A'")
    List<Position> findByActiveTrue();
    
    boolean existsByCode(String code);
}
