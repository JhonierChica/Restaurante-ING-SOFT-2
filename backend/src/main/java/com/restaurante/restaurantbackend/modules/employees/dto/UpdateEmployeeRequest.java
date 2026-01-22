package com.restaurante.restaurantbackend.modules.employees.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmployeeRequest {
    private String phone;
    private String address;
    private BigDecimal salary;
    private String position;
    private String department;
    private Boolean active;
}
