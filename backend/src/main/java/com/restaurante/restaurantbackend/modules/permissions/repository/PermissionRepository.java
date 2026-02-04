package com.restaurante.restaurantbackend.modules.permissions.repository;

import com.restaurante.restaurantbackend.modules.permissions.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    
    Optional<Permission> findByCode(String code);
    
    List<Permission> findByModule(String module);
    
    List<Permission> findByActiveTrue();
    
    boolean existsByCode(String code);
}
