package com.restaurante.restaurantbackend.modules.employees.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmployeeRequest {
    private Long positionId;
    private String phone;
    private String address;
    private Boolean active;
}
