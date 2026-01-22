package com.restaurante.restaurantbackend.modules.users.dto;

import com.restaurante.restaurantbackend.modules.users.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    private String username;
    private String email;
    private String password;
    private String fullName;
    private UserRole role;
}
