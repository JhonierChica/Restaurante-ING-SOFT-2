package com.restaurante.restaurantbackend.modules.profiles.repository;

import com.restaurante.restaurantbackend.modules.profiles.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    
    Optional<Profile> findByName(String name);
    
    List<Profile> findByStatus(String status);
    
    // Buscar perfiles activos (estado = 'A')
    default List<Profile> findByActiveTrue() {
        return findByStatus("A");
    }
    
    boolean existsByName(String name);
}
