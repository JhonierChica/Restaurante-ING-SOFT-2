package com.restaurante.restaurantbackend.modules.users.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    private String username;
    private String password;
    private String fullName;
    private Long profileId; // ID del perfil de seguridad
    private Long employeeId; // ID del empleado (opcional) para vincular usuario a empleado existente
}
