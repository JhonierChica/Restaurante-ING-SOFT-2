package com.restaurante.restaurantbackend.modules.orders.service;

import com.restaurante.restaurantbackend.modules.clients.model.Client;
import com.restaurante.restaurantbackend.modules.clients.repository.ClientRepository;
import com.restaurante.restaurantbackend.modules.menu.model.MenuItem;
import com.restaurante.restaurantbackend.modules.menu.repository.MenuItemRepository;
import com.restaurante.restaurantbackend.modules.orders.dto.*;
import com.restaurante.restaurantbackend.modules.orders.model.Order;
import com.restaurante.restaurantbackend.modules.orders.model.OrderItem;
import com.restaurante.restaurantbackend.modules.orders.repository.OrderRepository;
import com.restaurante.restaurantbackend.modules.tables.model.RestaurantTable;
import com.restaurante.restaurantbackend.modules.tables.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ClientRepository clientRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;

    public OrderService(OrderRepository orderRepository, 
                       ClientRepository clientRepository,
                       RestaurantTableRepository tableRepository,
                       MenuItemRepository menuItemRepository) {
        this.orderRepository = orderRepository;
        this.clientRepository = clientRepository;
        this.tableRepository = tableRepository;
        this.menuItemRepository = menuItemRepository;
    }

    public OrderResponse createOrder(CreateOrderRequest request) {
        // Validar que el cliente existe
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + request.getClientId()));

        // Validar que la mesa existe
        RestaurantTable table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + request.getTableId()));

        // Validar que hay items en el pedido
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Order must have at least one item");
        }

        // Crear la orden
        Order order = new Order();
        order.setClient(client);
        order.setTable(table);
        order.setStatus(Order.OrderStatus.PENDIENTE);
        order.setNotes(request.getNotes());

        // Agregar items del pedido
        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + itemRequest.getMenuItemId()));

            // Verificar que el item está disponible
            if (!menuItem.getAvailable()) {
                throw new RuntimeException("Menu item is not available: " + menuItem.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setSpecialInstructions(itemRequest.getSpecialInstructions());

            order.addItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
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
            order.setStatus(request.getStatus());
        }

        // Actualizar notas si se proporcionan
        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }

        // Actualizar items si se proporcionan
        if (request.getItems() != null) {
            // Limpiar items existentes
            order.getItems().clear();

            // Agregar nuevos items
            for (OrderItemRequest itemRequest : request.getItems()) {
                MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                        .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + itemRequest.getMenuItemId()));

                OrderItem orderItem = new OrderItem();
                orderItem.setMenuItem(menuItem);
                orderItem.setQuantity(itemRequest.getQuantity());
                orderItem.setSpecialInstructions(itemRequest.getSpecialInstructions());

                order.addItem(orderItem);
            }
        }

        Order updatedOrder = orderRepository.save(order);
        return mapToResponse(updatedOrder);
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
        response.setTableId(order.getTable().getId());
        response.setTableNumber(order.getTable().getTableNumber());
        response.setStatus(order.getStatus());
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
        response.setMenuItemPrice(item.getMenuItem().getPrice());
        response.setQuantity(item.getQuantity());
        response.setSpecialInstructions(item.getSpecialInstructions());
        return response;
    }
}
