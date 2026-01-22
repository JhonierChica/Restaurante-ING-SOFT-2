package com.restaurante.restaurantbackend.modules.auth.dto;

import com.restaurante.restaurantbackend.modules.users.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private UserRole role;
    private String message;
}
