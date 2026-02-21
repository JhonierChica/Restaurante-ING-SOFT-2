package com.restaurante.restaurantbackend.modules.deliveries.service;

import com.restaurante.restaurantbackend.modules.deliveries.dto.CreateDeliveryRequest;
import com.restaurante.restaurantbackend.modules.deliveries.dto.DeliveryResponse;
import com.restaurante.restaurantbackend.modules.deliveries.dto.UpdateDeliveryStatusRequest;
import com.restaurante.restaurantbackend.modules.deliveries.model.Delivery;
import com.restaurante.restaurantbackend.modules.deliveries.model.Delivery.DeliveryStatus;
import com.restaurante.restaurantbackend.modules.deliveries.repository.DeliveryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        delivery.setStatus(DeliveryStatus.PENDING);

        Delivery savedDelivery = deliveryRepository.save(delivery);
        return mapToResponse(savedDelivery);
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getAllDeliveries() {
        try {
            System.out.println("[DeliveryService] getAllDeliveries() called");
            List<Delivery> deliveries = deliveryRepository.findAllOrderByCreatedAtDesc();
            System.out.println("[DeliveryService] Found " + deliveries.size() + " deliveries in database");
            
            List<DeliveryResponse> responses = deliveries.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
            
            System.out.println("[DeliveryService] Mapped to " + responses.size() + " responses");
            return responses;
        } catch (Exception e) {
            System.err.println("[DeliveryService] ERROR in getAllDeliveries: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public DeliveryResponse getDeliveryById(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Domicilio no encontrado con id: " + id));
        return mapToResponse(delivery);
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getActiveDeliveries() {
        return deliveryRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .filter(d -> d.getStatus() == DeliveryStatus.PENDING 
                          || d.getStatus() == DeliveryStatus.IN_TRANSIT 
                          || d.getStatus() == DeliveryStatus.DELIVERED)
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

        Delivery updatedDelivery = deliveryRepository.save(delivery);
        return mapToResponse(updatedDelivery);
    }

    private DeliveryResponse mapToResponse(Delivery delivery) {
        try {
            System.out.println("[DeliveryService] Mapping delivery ID: " + delivery.getId() + ", OrderID: " + delivery.getOrderId());
            DeliveryResponse response = new DeliveryResponse();
            response.setId(delivery.getId());
            response.setOrderId(delivery.getOrderId());
            response.setStatus(delivery.getStatus().name());
            response.setCreatedAt(delivery.getCreatedAt());
            System.out.println("[DeliveryService] Successfully mapped delivery ID: " + delivery.getId());
            return response;
        } catch (Exception e) {
            System.err.println("[DeliveryService] ERROR mapping delivery ID " + delivery.getId() + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
