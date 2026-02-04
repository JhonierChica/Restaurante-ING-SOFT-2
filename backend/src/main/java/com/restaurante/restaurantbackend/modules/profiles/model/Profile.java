package com.restaurante.restaurantbackend.modules.profiles.model;

import com.restaurante.restaurantbackend.modules.permissions.model.Permission;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Profile representa un rol de seguridad en el sistema con permisos específicos.
 * Define QUÉ puede hacer un usuario en el sistema.
 * Ejemplos: "Mesero", "Cajero", "Gerente", "Administrador"
 */
@Entity
@Table(name = "profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // Ej: "WAITER", "CASHIER", "MANAGER", "ADMIN"

    @Column(nullable = false, length = 100)
    private String name; // Ej: "Mesero", "Cajero", "Gerente"

    @Column(length = 255)
    private String description;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "profile_permissions",
        joinColumns = @JoinColumn(name = "profile_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
