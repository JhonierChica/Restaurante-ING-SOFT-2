package com.restaurante.restaurantbackend.modules.employees.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeRequest {
    private Long userId;
    private String documentNumber;
    private String phone;
    private String address;
    private LocalDate hireDate;
    private BigDecimal salary;
    private String position;
    private String department;
}
