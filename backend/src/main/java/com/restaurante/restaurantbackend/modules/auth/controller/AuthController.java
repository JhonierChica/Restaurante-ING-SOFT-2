package com.restaurante.restaurantbackend.modules.auth.controller;

import com.restaurante.restaurantbackend.modules.auth.dto.LoginRequest;
import com.restaurante.restaurantbackend.modules.auth.dto.LoginResponse;
import com.restaurante.restaurantbackend.modules.auth.service.AuthService;
import com.restaurante.restaurantbackend.modules.users.model.UserRole;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(
                LoginResponse.builder()
                    .message(e.getMessage())
                    .build()
            );
        }
    }

    @GetMapping("/validate-role/{userId}")
    public ResponseEntity<Boolean> validateRole(
            @PathVariable Long userId, 
            @RequestParam UserRole role) {
        try {
            boolean isValid = authService.validateUserRole(userId, role);
            return ResponseEntity.ok(isValid);
        } catch (RuntimeException e) {
            return ResponseEntity.ok(false);
        }
    }

    @GetMapping("/has-role/{userId}")
    public ResponseEntity<Boolean> hasRole(
            @PathVariable Long userId, 
            @RequestParam UserRole[] roles) {
        try {
            boolean hasRole = authService.hasRole(userId, roles);
            return ResponseEntity.ok(hasRole);
        } catch (RuntimeException e) {
            return ResponseEntity.ok(false);
        }
    }

    @GetMapping("/is-admin/{userId}")
    public ResponseEntity<Boolean> isAdmin(@PathVariable Long userId) {
        try {
            boolean isAdmin = authService.isAdmin(userId);
            return ResponseEntity.ok(isAdmin);
        } catch (RuntimeException e) {
            return ResponseEntity.ok(false);
        }
    }

    @GetMapping("/get-role/{userId}")
    public ResponseEntity<UserRole> getUserRole(@PathVariable Long userId) {
        try {
            UserRole role = authService.getUserRole(userId);
            return ResponseEntity.ok(role);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
