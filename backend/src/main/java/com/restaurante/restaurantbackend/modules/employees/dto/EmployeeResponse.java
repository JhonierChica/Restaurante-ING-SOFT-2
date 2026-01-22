package com.restaurante.restaurantbackend.modules.employees.dto;

import com.restaurante.restaurantbackend.modules.users.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private Long id;
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private UserRole role;
    private String documentNumber;
    private String phone;
    private String address;
    private LocalDate hireDate;
    private BigDecimal salary;
    private String position;
    private String department;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
