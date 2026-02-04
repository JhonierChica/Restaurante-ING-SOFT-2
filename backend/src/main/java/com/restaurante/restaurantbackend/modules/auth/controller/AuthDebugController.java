package com.restaurante.restaurantbackend.modules.auth.controller;

import com.restaurante.restaurantbackend.modules.auth.dto.LoginRequest;
import com.restaurante.restaurantbackend.modules.users.model.User;
import com.restaurante.restaurantbackend.modules.users.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controlador de debug para diagnosticar problemas de autenticación.
 * ⚠️ ELIMINAR EN PRODUCCIÓN - SOLO PARA DESARROLLO
 */
@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "*")
public class AuthDebugController {

    private final UserRepository userRepository;

    public AuthDebugController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Lista todos los usuarios con información detallada para debugging
     */
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsersDebug() {
        List<User> users = userRepository.findAll();
        
        List<Map<String, Object>> userDebugInfo = users.stream().map(user -> {
            Map<String, Object> info = new HashMap<>();
            info.put("id", user.getId());
            info.put("username", user.getUsername());
            info.put("usernameLength", user.getUsername().length());
            info.put("usernameBytes", user.getUsername().getBytes().length);
            info.put("passwordLength", user.getPassword() != null ? user.getPassword().length() : 0);
            info.put("passwordIsEmpty", user.getPassword() == null || user.getPassword().isEmpty());
            info.put("passwordFirstChar", user.getPassword() != null && !user.getPassword().isEmpty() 
                ? (int) user.getPassword().charAt(0) : null);
            info.put("active", user.getActive());
            info.put("hasProfile", user.getProfile() != null);
            info.put("profileId", user.getProfile() != null ? user.getProfile().getId() : null);
            info.put("profileCode", user.getProfile() != null ? user.getProfile().getCode() : null);
            info.put("profileActive", user.getProfile() != null ? user.getProfile().getActive() : null);
            info.put("permissionsCount", user.getProfile() != null ? user.getProfile().getPermissions().size() : 0);
            return info;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(userDebugInfo);
    }

    /**
     * Verifica credenciales sin hacer login real
     */
    @PostMapping("/verify-credentials")
    public ResponseEntity<Map<String, Object>> verifyCredentials(@RequestBody LoginRequest request) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Información de entrada
            result.put("input_username", request.getUsername());
            result.put("input_username_trimmed", request.getUsername() != null ? request.getUsername().trim() : null);
            result.put("input_password_length", request.getPassword() != null ? request.getPassword().length() : 0);
            result.put("input_password_trimmed_length", 
                request.getPassword() != null ? request.getPassword().trim().length() : 0);
            
            String username = request.getUsername() != null ? request.getUsername().trim() : "";
            String password = request.getPassword() != null ? request.getPassword().trim() : "";
            
            // Buscar usuario
            User user = userRepository.findByUsername(username).orElse(null);
            
            if (user == null) {
                result.put("userFound", false);
                result.put("message", "Usuario no encontrado en la base de datos");
                
                // Buscar usuarios similares
                List<String> similarUsers = userRepository.findAll().stream()
                    .filter(u -> u.getUsername().toLowerCase().contains(username.toLowerCase()))
                    .map(User::getUsername)
                    .collect(Collectors.toList());
                result.put("similarUsers", similarUsers);
                
                return ResponseEntity.ok(result);
            }
            
            result.put("userFound", true);
            result.put("userId", user.getId());
            result.put("username", user.getUsername());
            result.put("active", user.getActive());
            result.put("stored_password_length", user.getPassword().length());
            result.put("passwords_match", user.getPassword().equals(password));
            result.put("passwords_match_exact", user.getPassword().equals(request.getPassword()));
            
            // Comparación carácter por carácter
            if (!user.getPassword().equals(password)) {
                result.put("stored_password_first_chars", 
                    user.getPassword().length() > 0 ? user.getPassword().substring(0, Math.min(3, user.getPassword().length())) : "");
                result.put("input_password_first_chars", 
                    password.length() > 0 ? password.substring(0, Math.min(3, password.length())) : "");
            }
            
            // Información del perfil
            if (user.getProfile() != null) {
                result.put("hasProfile", true);
                result.put("profileId", user.getProfile().getId());
                result.put("profileCode", user.getProfile().getCode());
                result.put("profileName", user.getProfile().getName());
                result.put("profileActive", user.getProfile().getActive());
                result.put("permissionsCount", user.getProfile().getPermissions().size());
            } else {
                result.put("hasProfile", false);
                result.put("message", "⚠️ Usuario sin perfil asignado");
            }
            
            // Diagnóstico
            if (!user.getActive()) {
                result.put("diagnosis", "❌ Usuario desactivado");
            } else if (user.getProfile() == null) {
                result.put("diagnosis", "❌ Usuario sin perfil asignado");
            } else if (!user.getProfile().getActive()) {
                result.put("diagnosis", "❌ Perfil desactivado");
            } else if (!user.getPassword().equals(password)) {
                result.put("diagnosis", "❌ Contraseña incorrecta");
            } else {
                result.put("diagnosis", "✅ Credenciales válidas - Login debería funcionar");
            }
            
        } catch (Exception e) {
            result.put("error", true);
            result.put("message", e.getMessage());
            result.put("stackTrace", e.getStackTrace()[0].toString());
        }
        
        return ResponseEntity.ok(result);
    }

    /**
     * Obtiene información detallada de un usuario específico
     */
    @GetMapping("/user/{username}")
    public ResponseEntity<Map<String, Object>> getUserDebug(@PathVariable String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        
        if (user == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("found", false);
            error.put("message", "Usuario no encontrado: " + username);
            return ResponseEntity.ok(error);
        }
        
        Map<String, Object> info = new HashMap<>();
        info.put("found", true);
        info.put("id", user.getId());
        info.put("username", user.getUsername());
        info.put("fullName", user.getFullName());
        info.put("active", user.getActive());
        info.put("hasPassword", user.getPassword() != null && !user.getPassword().isEmpty());
        info.put("passwordLength", user.getPassword() != null ? user.getPassword().length() : 0);
        
        if (user.getProfile() != null) {
            Map<String, Object> profileInfo = new HashMap<>();
            profileInfo.put("id", user.getProfile().getId());
            profileInfo.put("code", user.getProfile().getCode());
            profileInfo.put("name", user.getProfile().getName());
            profileInfo.put("active", user.getProfile().getActive());
            profileInfo.put("permissionsCount", user.getProfile().getPermissions().size());
            profileInfo.put("permissions", user.getProfile().getPermissions().stream()
                .map(p -> p.getCode())
                .collect(Collectors.toList()));
            info.put("profile", profileInfo);
        } else {
            info.put("profile", null);
            info.put("warning", "Usuario sin perfil asignado");
        }
        
        return ResponseEntity.ok(info);
    }

    /**
     * Reinicia la contraseña de un usuario (para pruebas)
     */
    @PostMapping("/reset-password/{username}")
    public ResponseEntity<Map<String, Object>> resetPassword(
            @PathVariable String username,
            @RequestParam String newPassword) {
        
        Map<String, Object> result = new HashMap<>();
        
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            result.put("success", false);
            result.put("message", "Usuario no encontrado");
            return ResponseEntity.ok(result);
        }
        
        user.setPassword(newPassword.trim());
        userRepository.save(user);
        
        result.put("success", true);
        result.put("message", "Contraseña actualizada exitosamente");
        result.put("newPasswordLength", newPassword.trim().length());
        
        return ResponseEntity.ok(result);
    }
}
