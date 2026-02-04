package com.restaurante.restaurantbackend.modules.employees.model;

import com.restaurante.restaurantbackend.modules.positions.model.Position;
import com.restaurante.restaurantbackend.modules.users.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Employee representa a una persona que trabaja en el restaurante.
 * Vincula la información personal y laboral con:
 * - User (credencial de acceso al sistema)
 * - Position (cargo/puesto laboral que ocupa)
 */
@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user; // Usuario del sistema (credencial de acceso) - Puede ser null hasta que se cree el usuario

    @ManyToOne
    @JoinColumn(name = "position_id", nullable = false)
    private Position position; // Cargo/puesto que ocupa

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName; // Nombres del empleado

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName; // Apellidos del empleado

    @Column(name = "document_number", unique = true, length = 50)
    private String documentNumber;

    @Column(unique = true, length = 150)
    private String email; // Correo electrónico del empleado

    @Column(length = 20)
    private String phone;

    @Column(length = 200)
    private String address;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(precision = 10, scale = 2)
    private BigDecimal salary; // Salario específico del empleado (puede diferir del base)

    @Column(length = 500)
    private String notes; // Notas adicionales sobre el empleado

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
