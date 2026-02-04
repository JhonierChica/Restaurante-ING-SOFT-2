package com.restaurante.restaurantbackend.modules.profiles.dto;

import com.restaurante.restaurantbackend.modules.permissions.dto.PermissionResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Set<PermissionResponse> permissions;
    private Boolean active;
}
