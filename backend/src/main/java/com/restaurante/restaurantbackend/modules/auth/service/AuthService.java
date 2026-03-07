package com.restaurante.restaurantbackend.modules.auth.service;

import com.restaurante.restaurantbackend.modules.auth.dto.LoginRequest;
import com.restaurante.restaurantbackend.modules.auth.dto.LoginResponse;
import com.restaurante.restaurantbackend.modules.profiles.dto.ProfileResponse;
import com.restaurante.restaurantbackend.modules.users.model.User;
import com.restaurante.restaurantbackend.modules.users.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt - Username: {}", request.getUsername());
        
        // Validar que se proporcionen credenciales
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            log.warn("Login failed: Username is empty");
            throw new RuntimeException("Username is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            log.warn("Login failed: Password is empty");
            throw new RuntimeException("Password is required");
        }
        
        // Limpiar espacios en blanco
        String username = request.getUsername().trim();
        String password = request.getPassword().trim();
        
        log.debug("Searching user: {}", username);
        
        // Buscar usuario por username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found - {}", username);
                    return new RuntimeException("Invalid username or password");
                });

        log.debug("User found: ID={}, Active={}", user.getId(), user.getActive());
        
        // Verificar si el usuario está activo
        if (!user.getActive()) {
            log.warn("Login failed: User is deactivated - {}", username);
            throw new RuntimeException("User account is deactivated");
        }

        // Verificar password (simple comparación)
        if (!user.getPassword().equals(password)) {
            log.warn("Login failed: Invalid password for user - {}", username);
            throw new RuntimeException("Invalid username or password");
        }
        
        log.debug("Password verified for user: {}", username);

        // Verificar que tenga perfil
        if (user.getProfile() == null) {
            log.warn("Login failed: User has no profile assigned - {}", username);
            throw new RuntimeException("User has no profile assigned. Contact administrator.");
        }
        
        log.debug("Profile found: {} (Active={}, Permissions={})", 
                user.getProfile().getName(), user.getProfile().getActive(), 
                user.getProfile().getPermissions().size());
        
        // Verificar que el perfil esté activo
        if (!user.getProfile().getActive()) {
            log.warn("Login failed: Profile is deactivated - {}", user.getProfile().getName());
            throw new RuntimeException("Your profile has been deactivated. Contact administrator.");
        }

        // Construir ProfileResponse
        ProfileResponse profileResponse = ProfileResponse.fromEntity(user.getProfile());

        // Generar token simple (en producción usar JWT)
        String token = "Bearer_" + user.getId() + "_" + System.currentTimeMillis();
        
        log.info("Login successful for user: {} (Role: {})", username, user.getProfile().getName());

        // Retornar información del usuario autenticado
        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .profile(profileResponse)
                .message("Login successful")
                .build();
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(Long userId, String permissionCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getActive() || user.getProfile() == null) {
            return false;
        }

        return user.getProfile().getPermissions().stream()
                .anyMatch(p -> p.getCode().equals(permissionCode) && p.getActive());
    }

    @Transactional(readOnly = true)
    public boolean hasProfile(Long userId, String... profileCodes) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getActive() || user.getProfile() == null) {
            return false;
        }

        String userProfileCode = user.getProfile().getName(); // Usar name en lugar de code
        for (String profileCode : profileCodes) {
            if (userProfileCode.equals(profileCode)) {
                return true;
            }
        }
        return false;
    }

    @Transactional(readOnly = true)
    public boolean isAdmin(Long userId) {
        return hasProfile(userId, "ADMIN");
    }

    @Transactional(readOnly = true)
    public String getUserProfileCode(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getProfile() != null ? user.getProfile().getName() : null; // Usar name en lugar de code
    }
}
