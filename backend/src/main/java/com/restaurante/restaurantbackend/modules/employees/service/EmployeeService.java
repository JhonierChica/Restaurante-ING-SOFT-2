package com.restaurante.restaurantbackend.modules.employees.service;

import com.restaurante.restaurantbackend.modules.employees.dto.CreateEmployeeRequest;
import com.restaurante.restaurantbackend.modules.employees.dto.EmployeeResponse;
import com.restaurante.restaurantbackend.modules.employees.dto.UpdateEmployeeRequest;
import com.restaurante.restaurantbackend.modules.employees.model.Employee;
import com.restaurante.restaurantbackend.modules.employees.repository.EmployeeRepository;
import com.restaurante.restaurantbackend.modules.permissions.dto.PermissionResponse;
import com.restaurante.restaurantbackend.modules.positions.dto.PositionResponse;
import com.restaurante.restaurantbackend.modules.positions.model.Position;
import com.restaurante.restaurantbackend.modules.positions.repository.PositionRepository;
import com.restaurante.restaurantbackend.modules.profiles.dto.ProfileResponse;
import com.restaurante.restaurantbackend.modules.profiles.model.Profile;
import com.restaurante.restaurantbackend.modules.profiles.repository.ProfileRepository;
import com.restaurante.restaurantbackend.modules.users.model.User;
import com.restaurante.restaurantbackend.modules.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PositionRepository positionRepository;
    private final ProfileRepository profileRepository;

    public EmployeeService(EmployeeRepository employeeRepository, 
                          UserRepository userRepository,
                          PositionRepository positionRepository,
                          ProfileRepository profileRepository) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.positionRepository = positionRepository;
        this.profileRepository = profileRepository;
    }

    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {
        System.out.println("📥 Recibiendo petición para crear empleado:");
        System.out.println("   - firstName: " + request.getFirstName());
        System.out.println("   - lastName: " + request.getLastName());
        System.out.println("   - email: " + request.getEmail());
        System.out.println("   - positionId: " + request.getPositionId());
        
        // VALIDACIONES
        
        // 1. Validar email único si se proporciona
        if (request.getEmail() != null && 
            employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado: " + request.getEmail());
        }
        
        // 2. Validar documento único si se proporciona
        if (request.getDocumentNumber() != null && 
            employeeRepository.existsByDocumentNumber(request.getDocumentNumber())) {
            throw new RuntimeException("El número de documento ya existe: " + request.getDocumentNumber());
        }
        
        // 3. Validar que el cargo existe
        Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new RuntimeException("Cargo no encontrado con id: " + request.getPositionId()));
        System.out.println("✅ Cargo encontrado: " + position.getName());
        
        // CREAR EMPLEADO (sin usuario por ahora)
        Employee employee = new Employee();
        employee.setUser(null); // Se asignará cuando se cree el usuario
        employee.setPosition(position);
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setDocumentNumber(request.getDocumentNumber());
        employee.setPhone(request.getPhone());
        employee.setAddress(request.getAddress());
        employee.setHireDate(LocalDate.now()); // Fecha de hoy por defecto
        employee.setSalary(position.getBaseSalary()); // Usar el salario base del cargo
        employee.setActive(true);

        Employee savedEmployee = employeeRepository.save(employee);
        System.out.println("✅ Empleado creado con ID: " + savedEmployee.getId());
        System.out.println("🎉 Empleado creado exitosamente sin usuario");
        
        return mapToResponse(savedEmployee);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getActiveEmployees() {
        return employeeRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployeesWithoutUser() {
        return employeeRepository.findByUserIsNull().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        return mapToResponse(employee);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeByUserId(Long userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employee not found for user id: " + userId));
        return mapToResponse(employee);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployeesByPositionId(Long positionId) {
        return employeeRepository.findByPositionId(positionId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EmployeeResponse updateEmployee(Long id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Position not found with id: " + request.getPositionId()));
            employee.setPosition(position);
        }

        if (request.getPhone() != null) {
            employee.setPhone(request.getPhone());
        }

        if (request.getAddress() != null) {
            employee.setAddress(request.getAddress());
        }

        if (request.getActive() != null) {
            employee.setActive(request.getActive());
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        return mapToResponse(updatedEmployee);
    }

    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new RuntimeException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
    }

    public void deactivateEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        employee.setActive(false);
        employeeRepository.save(employee);
    }

    private EmployeeResponse mapToResponse(Employee employee) {
        // Mapear Position
        PositionResponse positionResponse = null;
        if (employee.getPosition() != null) {
            positionResponse = new PositionResponse(
                    employee.getPosition().getId(),
                    employee.getPosition().getCode(),
                    employee.getPosition().getName(),
                    employee.getPosition().getDescription(),
                    employee.getPosition().getDepartment(),
                    employee.getPosition().getBaseSalary(),
                    employee.getPosition().getResponsibilities(),
                    employee.getPosition().getActive()
            );
        }

        // Mapear Profile (solo si tiene usuario)
        ProfileResponse profileResponse = null;
        Long userId = null;
        String username = null;
        
        if (employee.getUser() != null) {
            userId = employee.getUser().getId();
            username = employee.getUser().getUsername();
            
            if (employee.getUser().getProfile() != null) {
                profileResponse = new ProfileResponse(
                        employee.getUser().getProfile().getId(),
                        employee.getUser().getProfile().getCode(),
                        employee.getUser().getProfile().getName(),
                        employee.getUser().getProfile().getDescription(),
                        employee.getUser().getProfile().getPermissions().stream()
                                .map(p -> new PermissionResponse(
                                        p.getId(),
                                        p.getCode(),
                                        p.getName(),
                                        p.getDescription(),
                                        p.getModule(),
                                        p.getActive()
                                ))
                                .collect(Collectors.toSet()),
                        employee.getUser().getProfile().getActive()
                );
            }
        }

        // Construir nombre completo
        String fullName = employee.getFirstName() + " " + employee.getLastName();

        return EmployeeResponse.builder()
                .id(employee.getId())
                .userId(userId)
                .username(username)
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .fullName(fullName)
                .email(employee.getEmail())
                .profile(profileResponse)
                .position(positionResponse)
                .documentNumber(employee.getDocumentNumber())
                .phone(employee.getPhone())
                .address(employee.getAddress())
                .hireDate(employee.getHireDate())
                .salary(employee.getSalary())
                .notes(employee.getNotes())
                .active(employee.getActive())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }
}
