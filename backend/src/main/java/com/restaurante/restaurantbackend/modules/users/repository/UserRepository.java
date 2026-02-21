package com.restaurante.restaurantbackend.modules.users.repository;

import com.restaurante.restaurantbackend.modules.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    boolean existsByUsername(String username);
    
    List<User> findByProfileId(Long profileId);
    
    List<User> findByActiveTrue();
    
    Optional<User> findByEmployeeId(Long employeeId);
}
