package com.restaurante.restaurantbackend.modules.employees.repository;

import com.restaurante.restaurantbackend.modules.employees.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    Optional<Employee> findByUserId(Long userId);
    
    Optional<Employee> findByDocumentNumber(String documentNumber);
    
    boolean existsByDocumentNumber(String documentNumber);
    
    boolean existsByEmail(String email);
    
    boolean existsByUserId(Long userId);
    
    List<Employee> findByActiveTrue();
    
    List<Employee> findByPositionId(Long positionId);
    
    // Obtener empleados sin usuario asignado
    List<Employee> findByUserIsNull();
}
