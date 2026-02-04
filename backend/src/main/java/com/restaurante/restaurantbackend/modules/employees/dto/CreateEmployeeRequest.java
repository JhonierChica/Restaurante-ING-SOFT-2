package com.restaurante.restaurantbackend.modules.employees.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeRequest {
    // Datos del empleado
    @NotNull(message = "El ID del cargo es obligatorio")
    private Long positionId; // ID del cargo que ocupará
    
    @NotBlank(message = "Los nombres son obligatorios")
    private String firstName; // Nombres del empleado
    
    @NotBlank(message = "Los apellidos son obligatorios")
    private String lastName; // Apellidos del empleado
    
    private String documentNumber; // Número de documento
    
    @Email(message = "El email debe ser válido")
    @NotBlank(message = "El email es obligatorio")
    private String email; // Email del empleado
    
    private String phone; // Teléfono
    
    private String address; // Dirección
}
