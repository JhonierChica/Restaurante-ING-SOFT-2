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
import com.restaurante.restaurantbackend.modules.profiles.repository.ProfileRepository;
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
    private final PositionRepository positionRepository;
    private final UserRepository userRepository;
    
    public EmployeeService(EmployeeRepository employeeRepository, 
                          UserRepository userRepository,
                          PositionRepository positionRepository,
                          ProfileRepository profileRepository) {
        this.employeeRepository = employeeRepository;
        this.positionRepository = positionRepository;
        this.userRepository = userRepository;
    }

    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {
        System.out.println("📥 Recibiendo petición para crear empleado:");
        System.out.println("   - firstName: " + request.getFirstName());
        System.out.println("   - lastName: " + request.getLastName());
        System.out.println("   - email: " + request.getEmail());
        System.out.println("   - positionId: " + request.getPositionId());
        
        // VALIDACIONES
        
        // 1. Validar email único
        if (request.getEmail() != null && 
            employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado: " + request.getEmail());
        }
        
        // 2. Validar documento único si se proporciona
        if (request.getDocumentNumber() != null && !request.getDocumentNumber().trim().isEmpty() &&
            employeeRepository.existsByDocumentNumber(request.getDocumentNumber())) {
            throw new RuntimeException("El número de documento ya existe: " + request.getDocumentNumber());
        }
        
        // 3. Validar que el cargo existe
        Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new RuntimeException("Cargo no encontrado con id: " + request.getPositionId()));
        System.out.println("✅ Cargo encontrado: " + position.getName());
        
        // CREAR EMPLEADO
        Employee employee = new Employee();
        employee.setPosition(position);
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setDocumentNumber(request.getDocumentNumber());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setAddress(request.getAddress());
        
        // Campos transient (no se guardan en BD)
        employee.setHireDate(LocalDate.now());
        employee.setSalary(position.getBaseSalary());
        employee.setActive(true);

        Employee savedEmployee = employeeRepository.save(employee);
        System.out.println("✅ Empleado creado con ID: " + savedEmployee.getId());
        
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

    // Método deshabilitado - la relación User->Employee se maneja desde User
    // @Transactional(readOnly = true)
    // public EmployeeResponse getEmployeeByUserId(Long userId) {
    //     throw new RuntimeException("Método no disponible - usar User para obtener Employee");
    // }

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

        if (request.getFirstName() != null) {
            employee.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            employee.setLastName(request.getLastName());
        }

        if (request.getDocumentNumber() != null) {
            // Validar que el documento no esté en uso por otro empleado
            if (employeeRepository.existsByDocumentNumber(request.getDocumentNumber())) {
                Employee existingEmployee = employeeRepository.findByDocumentNumber(request.getDocumentNumber())
                        .orElse(null);
                if (existingEmployee != null && !existingEmployee.getId().equals(id)) {
                    throw new RuntimeException("El número de documento ya existe: " + request.getDocumentNumber());
                }
            }
            employee.setDocumentNumber(request.getDocumentNumber());
        }

        if (request.getEmail() != null) {
            // Validar que el email no esté en uso por otro empleado
            if (employeeRepository.existsByEmail(request.getEmail())) {
                Employee existingEmployee = employeeRepository.findByEmail(request.getEmail())
                        .orElse(null);
                if (existingEmployee != null && !existingEmployee.getId().equals(id)) {
                    throw new RuntimeException("El email ya está registrado: " + request.getEmail());
                }
            }
            employee.setEmail(request.getEmail());
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

        // Buscar usuario asociado a este empleado desde UserRepository
        ProfileResponse profileResponse = null;
        Long userId = null;
        String username = null;
        
        // Buscar usuario por employeeId de forma optimizada
        var userOptional = userRepository.findByEmployeeId(employee.getId());
        
        if (userOptional.isPresent()) {
            var user = userOptional.get();
            userId = user.getId();
            username = user.getUsername();
            
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
