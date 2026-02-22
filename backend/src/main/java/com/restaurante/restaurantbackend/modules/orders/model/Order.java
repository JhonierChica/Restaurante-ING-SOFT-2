package com.restaurante.restaurantbackend.modules.orders.model;

import com.restaurante.restaurantbackend.modules.clients.model.Client;
import com.restaurante.restaurantbackend.modules.tables.model.RestaurantTable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Client client;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private com.restaurante.restaurantbackend.modules.users.model.User user; // Usuario que creó el pedido

    @Column(name = "`valor a pagar`", nullable = false)
    private Float totalAmount; // Usar Float porque la BD usa REAL

    @ManyToOne
    @JoinColumn(name = "id_mesa", nullable = false)
    private RestaurantTable table;

    @Column(name = "estado", nullable = false, length = 1)
    private String status = "P"; // P=Pendiente, E=En preparación, L=Listo, S=Servido, C=Cancelado

    @Column(name = "tipo_pedido", length = 20)
    private String orderType = "ESTABLECIMIENTO"; // ESTABLECIMIENTO o DOMICILIO

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Column(name = "notas")
    private String notes;
    
    // Campos adicionales no mapeados a BD
    @Transient
    private LocalDateTime createdAt;

    @Transient
    private LocalDateTime updatedAt;
    
    // Métodos helper para compatibilidad con OrderStatus enum
    public OrderStatus getOrderStatus() {
        if ("E".equals(status)) return OrderStatus.EN_PREPARACION;
        if ("L".equals(status)) return OrderStatus.LISTO;
        if ("S".equals(status)) return OrderStatus.SERVIDO;
        if ("C".equals(status)) return OrderStatus.CANCELADO;
        return OrderStatus.PENDIENTE;
    }
    
    public void setOrderStatus(OrderStatus orderStatus) {
        switch (orderStatus) {
            case EN_PREPARACION: this.status = "E"; break;
            case LISTO: this.status = "L"; break;
            case SERVIDO: this.status = "S"; break;
            case CANCELADO: this.status = "C"; break;
            default: this.status = "P";
        }
    }
    
    // Helper para convertir Float a BigDecimal si es necesario
    public BigDecimal getTotalAmountAsBigDecimal() {
        return totalAmount != null ? BigDecimal.valueOf(totalAmount) : BigDecimal.ZERO;
    }
    
    public void setTotalAmountFromBigDecimal(BigDecimal amount) {
        this.totalAmount = amount != null ? amount.floatValue() : 0f;
    }

    public enum OrderStatus {
        PENDIENTE,
        EN_PREPARACION,
        LISTO,
        SERVIDO,
        CANCELADO
    }

    public enum OrderType {
        ESTABLECIMIENTO,
        DOMICILIO
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}
