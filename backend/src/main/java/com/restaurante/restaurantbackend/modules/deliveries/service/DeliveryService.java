package com.restaurante.restaurantbackend.modules.deliveries.service;

import com.restaurante.restaurantbackend.modules.deliveries.dto.CreateDeliveryRequest;
import com.restaurante.restaurantbackend.modules.deliveries.dto.DeliveryResponse;
import com.restaurante.restaurantbackend.modules.deliveries.dto.UpdateDeliveryStatusRequest;
import com.restaurante.restaurantbackend.modules.deliveries.model.Delivery;
import com.restaurante.restaurantbackend.modules.deliveries.model.Delivery.DeliveryStatus;
import com.restaurante.restaurantbackend.modules.deliveries.repository.DeliveryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;

    public DeliveryService(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }

    @Transactional
    public DeliveryResponse createDelivery(CreateDeliveryRequest request) {
        Delivery delivery = new Delivery();
        delivery.setOrderId(request.getOrderId());
        delivery.setClientName(request.getClientName());
        delivery.setClientPhone(request.getClientPhone());
        delivery.setDeliveryAddress(request.getDeliveryAddress());
        delivery.setAddressReference(request.getAddressReference());
        delivery.setNeighborhood(request.getNeighborhood());
        delivery.setCity(request.getCity());
        delivery.setDeliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : BigDecimal.ZERO);
        delivery.setTotalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO);
        delivery.setStatus(DeliveryStatus.PENDING);
        delivery.setDeliveryPerson(request.getDeliveryPerson());
        delivery.setEstimatedTime(request.getEstimatedTime() != null ? request.getEstimatedTime() : 30);
        delivery.setNotes(request.getNotes());
        delivery.setPaymentMethod(request.getPaymentMethod());
        delivery.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : "PENDING");

        Delivery savedDelivery = deliveryRepository.save(delivery);
        return mapToResponse(savedDelivery);
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getAllDeliveries() {
        return deliveryRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeliveryResponse getDeliveryById(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Domicilio no encontrado con id: " + id));
        return mapToResponse(delivery);
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getActiveDeliveries() {
        return deliveryRepository.findActiveDeliveries()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getDeliveriesByStatus(String statusString) {
        DeliveryStatus status = DeliveryStatus.valueOf(statusString.toUpperCase());
        return deliveryRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getDeliveriesByPerson(String deliveryPerson) {
        return deliveryRepository.findByDeliveryPersonOrderByCreatedAtDesc(deliveryPerson)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getDeliveriesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return deliveryRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeliveryResponse getDeliveryByOrderId(Long orderId) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("No se encontró domicilio para la orden: " + orderId));
        return mapToResponse(delivery);
    }

    @Transactional
    public DeliveryResponse updateDeliveryStatus(Long id, UpdateDeliveryStatusRequest request) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Domicilio no encontrado con id: " + id));

        DeliveryStatus newStatus = DeliveryStatus.valueOf(request.getStatus().toUpperCase());
        delivery.setStatus(newStatus);

        if (request.getDeliveryPerson() != null) {
            delivery.setDeliveryPerson(request.getDeliveryPerson());
        }

        if (request.getNotes() != null) {
            delivery.setNotes(request.getNotes());
        }

        // Actualizar timestamps según el estado
        if (newStatus == DeliveryStatus.ASSIGNED && delivery.getAssignedAt() == null) {
            delivery.setAssignedAt(LocalDateTime.now());
        } else if (newStatus == DeliveryStatus.DELIVERED && delivery.getDeliveredAt() == null) {
            delivery.setDeliveredAt(LocalDateTime.now());
        }

        Delivery updatedDelivery = deliveryRepository.save(delivery);
        return mapToResponse(updatedDelivery);
    }

    private DeliveryResponse mapToResponse(Delivery delivery) {
        DeliveryResponse response = new DeliveryResponse();
        response.setId(delivery.getId());
        response.setOrderId(delivery.getOrderId());
        response.setClientName(delivery.getClientName());
        response.setClientPhone(delivery.getClientPhone());
        response.setDeliveryAddress(delivery.getDeliveryAddress());
        response.setAddressReference(delivery.getAddressReference());
        response.setNeighborhood(delivery.getNeighborhood());
        response.setCity(delivery.getCity());
        response.setDeliveryFee(delivery.getDeliveryFee());
        response.setTotalAmount(delivery.getTotalAmount());
        response.setStatus(delivery.getStatus().name());
        response.setDeliveryPerson(delivery.getDeliveryPerson());
        response.setAssignedAt(delivery.getAssignedAt());
        response.setDeliveredAt(delivery.getDeliveredAt());
        response.setEstimatedTime(delivery.getEstimatedTime());
        response.setNotes(delivery.getNotes());
        response.setPaymentMethod(delivery.getPaymentMethod());
        response.setPaymentStatus(delivery.getPaymentStatus());
        response.setCreatedAt(delivery.getCreatedAt());
        response.setUpdatedAt(delivery.getUpdatedAt());
        return response;
    }
}
