package com.restaurante.restaurantbackend.modules.categories.repository;

import com.restaurante.restaurantbackend.modules.categories.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findByName(String name);
    
    boolean existsByName(String name);
    
    List<Category> findByActiveTrue();
    
    List<Category> findByActiveTrueOrderByDisplayOrderAsc();
    
    @Query("SELECT COALESCE(MAX(c.displayOrder), 0) FROM Category c")
    Integer findMaxDisplayOrder();
}
