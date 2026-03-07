package com.restaurante.restaurantbackend.modules.permissions.controller;

import com.restaurante.restaurantbackend.modules.permissions.dto.PermissionResponse;
import com.restaurante.restaurantbackend.modules.permissions.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    public ResponseEntity<List<PermissionResponse>> getAllPermissions() {
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }

    @GetMapping("/active")
    public ResponseEntity<List<PermissionResponse>> getActivePermissions() {
        return ResponseEntity.ok(permissionService.getActivePermissions());
    }

    @GetMapping("/module/{module}")
    public ResponseEntity<List<PermissionResponse>> getPermissionsByModule(@PathVariable String module) {
        return ResponseEntity.ok(permissionService.getPermissionsByModule(module));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PermissionResponse> getPermissionById(@PathVariable Long id) {
        return ResponseEntity.ok(permissionService.getPermissionById(id));
    }
}
