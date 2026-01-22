package com.restaurante.restaurantbackend.modules.auth.service;

import com.restaurante.restaurantbackend.modules.auth.dto.LoginRequest;
import com.restaurante.restaurantbackend.modules.auth.dto.LoginResponse;
import com.restaurante.restaurantbackend.modules.users.model.User;
import com.restaurante.restaurantbackend.modules.users.model.UserRole;
import com.restaurante.restaurantbackend.modules.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LoginResponse login(LoginRequest request) {
        // Buscar usuario por username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        // Verificar si el usuario está activo
        if (!user.getActive()) {
            throw new RuntimeException("User account is deactivated");
        }

        // Verificar password (simple comparación - TODO: usar BCrypt)
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        // Retornar información del usuario autenticado
        return LoginResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .message("Login successful")
                .build();
    }

    @Transactional(readOnly = true)
    public boolean validateUserRole(Long userId, UserRole expectedRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return user.getRole().equals(expectedRole) && user.getActive();
    }

    @Transactional(readOnly = true)
    public boolean hasRole(Long userId, UserRole... roles) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getActive()) {
            return false;
        }

        for (UserRole role : roles) {
            if (user.getRole().equals(role)) {
                return true;
            }
        }
        return false;
    }

    @Transactional(readOnly = true)
    public boolean isAdmin(Long userId) {
        return hasRole(userId, UserRole.ADMIN);
    }

    @Transactional(readOnly = true)
    public boolean isManager(Long userId) {
        return hasRole(userId, UserRole.MANAGER);
    }

    @Transactional(readOnly = true)
    public UserRole getUserRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getRole();
    }
}
