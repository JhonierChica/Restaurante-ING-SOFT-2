package com.restaurante.restaurantbackend.modules.tables.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "restaurant_tables")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_number", nullable = false, unique = true)
    private Integer tableNumber;

    @Column(nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TableStatus status = TableStatus.DISPONIBLE;

    @Column(length = 255)
    private String location;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum TableStatus {
        DISPONIBLE,
        OCUPADA,
        RESERVADA,
        FUERA_DE_SERVICIO
    }
}
