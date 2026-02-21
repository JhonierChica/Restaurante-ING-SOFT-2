package com.restaurante.restaurantbackend.modules.orders.service;

import com.restaurante.restaurantbackend.modules.clients.model.Client;
import com.restaurante.restaurantbackend.modules.clients.repository.ClientRepository;
import com.restaurante.restaurantbackend.modules.deliveries.dto.CreateDeliveryRequest;
import com.restaurante.restaurantbackend.modules.deliveries.service.DeliveryService;
import com.restaurante.restaurantbackend.modules.menu.model.MenuItem;
import com.restaurante.restaurantbackend.modules.menu.repository.MenuItemRepository;
import com.restaurante.restaurantbackend.modules.orders.dto.*;
import com.restaurante.restaurantbackend.modules.orders.model.Order;
import com.restaurante.restaurantbackend.modules.orders.model.OrderItem;
import com.restaurante.restaurantbackend.modules.orders.repository.OrderRepository;
import com.restaurante.restaurantbackend.modules.tables.model.RestaurantTable;
import com.restaurante.restaurantbackend.modules.tables.repository.RestaurantTableRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @PersistenceContext
    private EntityManager entityManager;

    private final OrderRepository orderRepository;
    private final ClientRepository clientRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;
    private final com.restaurante.restaurantbackend.modules.users.repository.UserRepository userRepository;
    private final DeliveryService deliveryService;

    public OrderService(OrderRepository orderRepository, 
                       ClientRepository clientRepository,
                       RestaurantTableRepository tableRepository,
                       MenuItemRepository menuItemRepository,
                       com.restaurante.restaurantbackend.modules.users.repository.UserRepository userRepository,
                       DeliveryService deliveryService) {
        this.orderRepository = orderRepository;
        this.clientRepository = clientRepository;
        this.tableRepository = tableRepository;
        this.menuItemRepository = menuItemRepository;
        this.userRepository = userRepository;
        this.deliveryService = deliveryService;
    }

    public OrderResponse createOrder(CreateOrderRequest request) {
        System.out.println("[OrderService] Starting createOrder process...");
        
        // Validar que el cliente existe
        System.out.println("[OrderService] Validating client with ID: " + request.getClientId());
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + request.getClientId()));
        System.out.println("[OrderService] Client found: " + client.getName() + " | Phone: " + client.getPhone() + " | Address: " + client.getAddress());

        // Validar que el usuario existe
        System.out.println("[OrderService] Validating user with ID: " + request.getUserId());
        com.restaurante.restaurantbackend.modules.users.model.User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));
        System.out.println("[OrderService] User found: " + user.getUsername());

        // Validar que la mesa existe
        System.out.println("[OrderService] Validating table with ID: " + request.getTableId());
        RestaurantTable table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + request.getTableId()));
        System.out.println("[OrderService] Table found: #" + table.getTableNumber() + " | Location: " + table.getLocation());

        // Validar que hay items en el pedido
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Order must have at least one item");
        }

        // Calcular el total primero
        float totalAmount = 0f;
        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + itemRequest.getMenuItemId()));

            // Verificar que el item está disponible
            if (!menuItem.getAvailable()) {
                throw new RuntimeException("Menu item is not available: " + menuItem.getName());
            }

            // Calcular subtotal del item
            float itemSubtotal = menuItem.getPrice() * itemRequest.getQuantity();
            totalAmount += itemSubtotal;
        }

        // Crear la orden SIN items primero
        Order order = new Order();
        order.setClient(client);
        order.setUser(user);
        order.setTable(table);
        order.setOrderStatus(Order.OrderStatus.PENDIENTE);
        order.setOrderType(request.getOrderType() != null ? request.getOrderType() : "ESTABLECIMIENTO");
        order.setNotes(request.getNotes());
        order.setTotalAmount(totalAmount);

        // Guardar la orden para generar el ID
        Order savedOrder = orderRepository.save(order);
        
        // Flush para forzar el INSERT y generar el ID inmediatamente
        entityManager.flush();
        
        // Ahora agregar items con el Order ya persistido (tiene ID)
        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + itemRequest.getMenuItemId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder); // savedOrder ya tiene ID generado
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(menuItem.getPrice());
            orderItem.setSpecialInstructions(itemRequest.getSpecialInstructions());

            savedOrder.addItem(orderItem);
        }

        // No es necesario save() nuevamente - los items se persisten automáticamente
        // por CascadeType.ALL cuando termina la transacción
        
        // Si el pedido es de tipo DOMICILIO, crear automáticamente el registro en deliveries
        if ("DOMICILIO".equals(savedOrder.getOrderType())) {
            System.out.println("[OrderService] Order type is DOMICILIO, creating delivery record...");
            try {
                createDeliveryFromOrder(savedOrder);
                System.out.println("[OrderService] Delivery record created successfully");
            } catch (Exception e) {
                System.err.println("[OrderService] ERROR creating delivery: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Error creating delivery: " + e.getMessage());
            }
        }
        
        System.out.println("[OrderService] Order created successfully with ID: " + savedOrder.getId());
        return mapToResponse(savedOrder);
    }
    
    private void createDeliveryFromOrder(Order order) {
        System.out.println("[OrderService] Creating delivery from order ID: " + order.getId());
        
        CreateDeliveryRequest deliveryRequest = new CreateDeliveryRequest();
        deliveryRequest.setOrderId(order.getId());
        
        deliveryService.createDelivery(deliveryRequest);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        // Solo retornar pedidos de tipo ESTABLECIMIENTO para el módulo Orders
        return orderRepository.findByOrderType("ESTABLECIMIENTO").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrdersForPayments() {
        // Retornar TODAS las órdenes (ESTABLECIMIENTO y DOMICILIO) para el módulo de pagos
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByClient(Long clientId) {
        return orderRepository.findByClientId(clientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByTable(Long tableId) {
        return orderRepository.findByTableId(tableId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return mapToResponse(order);
    }

    public OrderResponse updateOrder(Long id, UpdateOrderRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        // Actualizar el estado si se proporciona
        if (request.getStatus() != null) {
            order.setOrderStatus(request.getStatus());
        }

        // Actualizar notas si se proporcionan
        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }

        // Actualizar items si se proporcionan
        if (request.getItems() != null) {
            // Limpiar items existentes
            order.getItems().clear();
            
            // Flush para eliminar items en la BD
            entityManager.flush();

            // Recalcular el total
            float totalAmount = 0f;

            // Agregar nuevos items (el order ya tiene ID, no hay problema)
            for (OrderItemRequest itemRequest : request.getItems()) {
                MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                        .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + itemRequest.getMenuItemId()));

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order); // order ya existe y tiene ID
                orderItem.setMenuItem(menuItem);
                orderItem.setQuantity(itemRequest.getQuantity());
                orderItem.setUnitPrice(menuItem.getPrice());
                orderItem.setSpecialInstructions(itemRequest.getSpecialInstructions());

                // Calcular subtotal del item
                float itemSubtotal = menuItem.getPrice() * itemRequest.getQuantity();
                totalAmount += itemSubtotal;

                order.addItem(orderItem);
            }
            
            // Actualizar el total de la orden
            order.setTotalAmount(totalAmount);
        }

        // No es necesario save() explícito - @Transactional lo maneja
        return mapToResponse(order);
    }

    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        orderRepository.delete(order);
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setClientId(order.getClient().getId());
        response.setClientName(order.getClient().getName());
        response.setClientPhone(order.getClient().getPhone());
        response.setClientAddress(order.getClient().getAddress());
        response.setTableId(order.getTable().getId());
        response.setTableNumber(order.getTable().getTableNumber());
        response.setStatus(order.getOrderStatus());
        response.setOrderType(order.getOrderType()); // Agregar tipo de pedido
        response.setTotal(order.getTotalAmount()); // Agregar el total
        response.setNotes(order.getNotes());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        // Mapear items
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::mapItemToResponse)
                .collect(Collectors.toList());
        response.setItems(items);

        return response;
    }

    private OrderItemResponse mapItemToResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setMenuItemId(item.getMenuItem().getId());
        response.setMenuItemName(item.getMenuItem().getName());
        response.setMenuItemPrice(item.getMenuItem().getPriceAsBigDecimal());
        response.setQuantity(item.getQuantity());
        response.setSpecialInstructions(item.getSpecialInstructions());
        return response;
    }
}
