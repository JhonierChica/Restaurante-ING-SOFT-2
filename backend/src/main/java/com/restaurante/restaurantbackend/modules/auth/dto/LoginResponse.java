package com.restaurante.restaurantbackend.modules.auth.dto;

import com.restaurante.restaurantbackend.modules.profiles.dto.ProfileResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long userId;
    private String username;
    private String fullName;
    private ProfileResponse profile;
    private String message;
}
