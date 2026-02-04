package com.restaurante.restaurantbackend.modules.users.model;

import com.restaurante.restaurantbackend.modules.profiles.model.Profile;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * User representa una credencial de acceso al sistema.
 * Es QUIÉN está usando el sistema (username, password, PIN).
 * Se le asigna un Profile que determina QUÉ puede hacer en el sistema.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", length = 150)
    private String fullName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile; // Perfil de seguridad que define permisos

    // Mantener role por compatibilidad temporal (DEPRECATED)
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserRole role;

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
