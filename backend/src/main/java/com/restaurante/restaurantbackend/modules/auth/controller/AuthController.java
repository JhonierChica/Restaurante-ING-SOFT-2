package com.restaurante.restaurantbackend.modules.auth.controller;

import com.restaurante.restaurantbackend.modules.auth.dto.LoginRequest;
import com.restaurante.restaurantbackend.modules.auth.dto.LoginResponse;
import com.restaurante.restaurantbackend.modules.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
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
            // Log del error para debugging
            System.err.println("❌ Login failed: " + e.getMessage());
            
            return ResponseEntity.status(401).body(
                LoginResponse.builder()
                    .message(e.getMessage())
                    .token(null)
                    .userId(null)
                    .username(null)
                    .build()
            );
        } catch (Exception e) {
            System.err.println("❌ Unexpected error during login: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500).body(
                LoginResponse.builder()
                    .message("Internal server error. Please try again.")
                    .build()
            );
        }
    }

    @GetMapping("/has-permission/{userId}")
    public ResponseEntity<Boolean> hasPermission(
            @PathVariable Long userId, 
            @RequestParam String permission) {
        try {
            boolean hasPermission = authService.hasPermission(userId, permission);
            return ResponseEntity.ok(hasPermission);
        } catch (RuntimeException e) {
            return ResponseEntity.ok(false);
        }
    }

    @GetMapping("/has-profile/{userId}")
    public ResponseEntity<Boolean> hasProfile(
            @PathVariable Long userId, 
            @RequestParam String[] profiles) {
        try {
            boolean hasProfile = authService.hasProfile(userId, profiles);
            return ResponseEntity.ok(hasProfile);
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

    @GetMapping("/get-profile/{userId}")
    public ResponseEntity<String> getUserProfile(@PathVariable Long userId) {
        try {
            String profileCode = authService.getUserProfileCode(userId);
            return ResponseEntity.ok(profileCode);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
