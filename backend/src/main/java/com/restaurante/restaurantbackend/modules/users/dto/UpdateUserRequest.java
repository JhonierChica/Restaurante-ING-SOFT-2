package com.restaurante.restaurantbackend.modules.users.dto;

import com.restaurante.restaurantbackend.modules.users.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    private String email;
    private String fullName;
    private UserRole role;
    private Boolean active;
}
