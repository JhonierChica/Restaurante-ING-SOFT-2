package com.restaurante.restaurantbackend.modules.users.service;

import com.restaurante.restaurantbackend.modules.employees.model.Employee;
import com.restaurante.restaurantbackend.modules.employees.repository.EmployeeRepository;
import com.restaurante.restaurantbackend.modules.permissions.dto.PermissionResponse;
import com.restaurante.restaurantbackend.modules.profiles.dto.ProfileResponse;
import com.restaurante.restaurantbackend.modules.profiles.model.Profile;
import com.restaurante.restaurantbackend.modules.profiles.repository.ProfileRepository;
import com.restaurante.restaurantbackend.modules.users.dto.CreateUserRequest;
import com.restaurante.restaurantbackend.modules.users.dto.UpdateUserRequest;
import com.restaurante.restaurantbackend.modules.users.dto.UserResponse;
import com.restaurante.restaurantbackend.modules.users.model.User;
import com.restaurante.restaurantbackend.modules.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final EmployeeRepository employeeRepository;

    public UserService(UserRepository userRepository, 
                      ProfileRepository profileRepository,
                      EmployeeRepository employeeRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.employeeRepository = employeeRepository;
    }

    public UserResponse createUser(CreateUserRequest request) {
        // Validar campos obligatorios
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        
        // Limpiar espacios en blanco
        String username = request.getUsername().trim();
        String password = request.getPassword().trim();
        
        // Validar que no exista el username
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        // Validar que el perfil existe
        Profile profile = profileRepository.findById(request.getProfileId())
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + request.getProfileId()));

        // Si se proporciona employeeId, validar que existe y no tenga usuario
        Employee employee = null;
        if (request.getEmployeeId() != null) {
            employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with id: " + request.getEmployeeId()));
            
            if (employee.getUser() != null) {
                throw new RuntimeException("Employee already has a user assigned");
            }
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(password); 
        user.setFullName(request.getFullName() != null ? request.getFullName().trim() : null);
        user.setProfile(profile);
        user.setActive(true);

        User savedUser = userRepository.save(user);
        
        // Si hay un empleado, vincular el usuario al empleado
        if (employee != null) {
            employee.setUser(savedUser);
            employeeRepository.save(employee);
        }

        return mapToResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getActiveUsers() {
        return userRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return mapToResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return mapToResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByProfileId(Long profileId) {
        return userRepository.findByProfileId(profileId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getProfileId() != null) {
            Profile profile = profileRepository.findById(request.getProfileId())
                    .orElseThrow(() -> new RuntimeException("Profile not found with id: " + request.getProfileId()));
            user.setProfile(profile);
        }

        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setActive(false);
        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user) {
        ProfileResponse profileResponse = null;
        if (user.getProfile() != null) {
            profileResponse = new ProfileResponse(
                    user.getProfile().getId(),
                    user.getProfile().getCode(),
                    user.getProfile().getName(),
                    user.getProfile().getDescription(),
                    user.getProfile().getPermissions().stream()
                            .map(p -> new PermissionResponse(
                                    p.getId(),
                                    p.getCode(),
                                    p.getName(),
                                    p.getDescription(),
                                    p.getModule(),
                                    p.getActive()
                            ))
                            .collect(Collectors.toSet()),
                    user.getProfile().getActive()
            );
        }

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .profile(profileResponse)
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
