package com.restaurante.restaurantbackend.modules.profiles.service;

import com.restaurante.restaurantbackend.modules.permissions.dto.PermissionResponse;
import com.restaurante.restaurantbackend.modules.permissions.model.Permission;
import com.restaurante.restaurantbackend.modules.permissions.repository.PermissionRepository;
import com.restaurante.restaurantbackend.modules.profiles.dto.CreateProfileRequest;
import com.restaurante.restaurantbackend.modules.profiles.dto.ProfileResponse;
import com.restaurante.restaurantbackend.modules.profiles.dto.UpdateProfileRequest;
import com.restaurante.restaurantbackend.modules.profiles.model.Profile;
import com.restaurante.restaurantbackend.modules.profiles.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final PermissionRepository permissionRepository;

    public ProfileService(ProfileRepository profileRepository, PermissionRepository permissionRepository) {
        this.profileRepository = profileRepository;
        this.permissionRepository = permissionRepository;
    }

    public ProfileResponse createProfile(CreateProfileRequest request) {
        if (profileRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Profile code already exists: " + request.getCode());
        }

        Profile profile = new Profile();
        profile.setCode(request.getCode().toUpperCase());
        profile.setName(request.getName());
        profile.setDescription(request.getDescription());
        profile.setActive(true);

        // Asignar permisos
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = new HashSet<>(
                permissionRepository.findAllById(request.getPermissionIds())
            );
            profile.setPermissions(permissions);
        }

        Profile savedProfile = profileRepository.save(profile);
        return mapToResponse(savedProfile);
    }

    @Transactional(readOnly = true)
    public List<ProfileResponse> getAllProfiles() {
        return profileRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProfileResponse> getActiveProfiles() {
        return profileRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfileById(Long id) {
        Profile profile = profileRepository.findByIdWithPermissions(id)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
        return mapToResponse(profile);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfileByCode(String code) {
        Profile profile = profileRepository.findByCodeWithPermissions(code)
                .orElseThrow(() -> new RuntimeException("Profile not found with code: " + code));
        return mapToResponse(profile);
    }

    public ProfileResponse updateProfile(Long id, UpdateProfileRequest request) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));

        if (request.getName() != null) {
            profile.setName(request.getName());
        }

        if (request.getDescription() != null) {
            profile.setDescription(request.getDescription());
        }

        if (request.getActive() != null) {
            profile.setActive(request.getActive());
        }

        // Actualizar permisos
        if (request.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>(
                permissionRepository.findAllById(request.getPermissionIds())
            );
            profile.setPermissions(permissions);
        }

        Profile updatedProfile = profileRepository.save(profile);
        return mapToResponse(updatedProfile);
    }

    public void deleteProfile(Long id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
        profile.setActive(false);
        profileRepository.save(profile);
    }

    private ProfileResponse mapToResponse(Profile profile) {
        Set<PermissionResponse> permissionResponses = profile.getPermissions().stream()
                .map(p -> new PermissionResponse(
                    p.getId(),
                    p.getCode(),
                    p.getName(),
                    p.getDescription(),
                    p.getModule(),
                    p.getActive()
                ))
                .collect(Collectors.toSet());

        return new ProfileResponse(
                profile.getId(),
                profile.getCode(),
                profile.getName(),
                profile.getDescription(),
                permissionResponses,
                profile.getActive()
        );
    }
}
