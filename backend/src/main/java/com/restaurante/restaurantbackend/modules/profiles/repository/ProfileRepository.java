package com.restaurante.restaurantbackend.modules.profiles.repository;

import com.restaurante.restaurantbackend.modules.profiles.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    
    Optional<Profile> findByCode(String code);
    
    List<Profile> findByActiveTrue();
    
    boolean existsByCode(String code);
    
    @Query("SELECT p FROM Profile p LEFT JOIN FETCH p.permissions WHERE p.id = :id")
    Optional<Profile> findByIdWithPermissions(@Param("id") Long id);
    
    @Query("SELECT p FROM Profile p LEFT JOIN FETCH p.permissions WHERE p.code = :code")
    Optional<Profile> findByCodeWithPermissions(@Param("code") String code);
}
