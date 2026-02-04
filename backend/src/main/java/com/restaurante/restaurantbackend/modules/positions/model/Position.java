package com.restaurante.restaurantbackend.modules.positions.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Position representa un cargo o puesto laboral dentro del restaurante.
 * Define QUÉ hace la persona en el organigrama y responsabilidades físicas.
 * Ejemplos: "Chef Ejecutivo", "Mesero", "Cajero", "Gerente de Piso"
 */
@Entity
@Table(name = "positions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // Ej: "CHEF", "WAITER", "CASHIER", "FLOOR_MANAGER"

    @Column(nullable = false, length = 100)
    private String name; // Ej: "Chef Ejecutivo", "Mesero"

    @Column(length = 255)
    private String description;

    @Column(nullable = false, length = 50)
    private String department; // Ej: "Cocina", "Servicio", "Administración"

    @Column(precision = 10, scale = 2)
    private BigDecimal baseSalary; // Salario base sugerido para este cargo

    @Column(length = 500)
    private String responsibilities; // Responsabilidades principales

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
