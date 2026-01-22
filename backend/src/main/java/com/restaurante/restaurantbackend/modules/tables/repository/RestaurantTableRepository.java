package com.restaurante.restaurantbackend.modules.tables.repository;

import com.restaurante.restaurantbackend.modules.tables.model.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    
    Optional<RestaurantTable> findByTableNumber(Integer tableNumber);
    
    List<RestaurantTable> findByStatus(RestaurantTable.TableStatus status);
    
    List<RestaurantTable> findByIsActiveTrue();
    
    List<RestaurantTable> findByStatusAndIsActiveTrue(RestaurantTable.TableStatus status);
}
