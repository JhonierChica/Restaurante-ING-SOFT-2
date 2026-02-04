package com.restaurante.restaurantbackend.config;

import com.restaurante.restaurantbackend.modules.permissions.model.Permission;
import com.restaurante.restaurantbackend.modules.permissions.repository.PermissionRepository;
import com.restaurante.restaurantbackend.modules.profiles.model.Profile;
import com.restaurante.restaurantbackend.modules.profiles.repository.ProfileRepository;
import com.restaurante.restaurantbackend.modules.users.model.User;
import com.restaurante.restaurantbackend.modules.users.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashSet;
import java.util.Set;

/**
 * Inicializador de datos básicos del sistema:
 * 1. Permisos del sistema (granular por módulo y acción)
 * 2. Perfil de ADMINISTRADOR con todos los permisos
 * 3. Usuario administrador inicial
 * 
 * El administrador puede crear:
 * - Nuevos perfiles personalizados
 * - Nuevos cargos/positions
 * - Nuevos usuarios con diferentes perfiles
 * - Nuevos empleados
 */
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(
            PermissionRepository permissionRepository,
            ProfileRepository profileRepository,
            UserRepository userRepository) {
        
        return args -> {
            // Solo inicializar si no hay datos (verificar permisos)
            if (permissionRepository.count() > 0) {
                System.out.println("⚠️  Base de datos ya contiene datos. Omitiendo inicialización.");
                return;
            }

            System.out.println("🚀 Iniciando carga de datos básicos del sistema...");

            // ============================================
            // 1. CREAR PERMISOS DEL SISTEMA
            // ============================================
            System.out.println("📋 Creando permisos del sistema...");
            
            Set<Permission> allPermissions = new HashSet<>();
            
            // Permisos de Pedidos
            allPermissions.add(createPermission(permissionRepository, "orders.view", "Ver Pedidos", "Ver listado de pedidos", "orders"));
            allPermissions.add(createPermission(permissionRepository, "orders.create", "Crear Pedidos", "Crear nuevos pedidos", "orders"));
            allPermissions.add(createPermission(permissionRepository, "orders.edit", "Editar Pedidos", "Modificar pedidos", "orders"));
            allPermissions.add(createPermission(permissionRepository, "orders.delete", "Eliminar Pedidos", "Eliminar pedidos", "orders"));
            
            // Permisos de Pagos
            allPermissions.add(createPermission(permissionRepository, "payments.view", "Ver Pagos", "Ver listado de pagos", "payments"));
            allPermissions.add(createPermission(permissionRepository, "payments.create", "Procesar Pagos", "Procesar pagos de clientes", "payments"));
            allPermissions.add(createPermission(permissionRepository, "payments.close", "Cerrar Caja", "Cerrar caja al final del turno", "payments"));
            
            // Permisos de Menú
            allPermissions.add(createPermission(permissionRepository, "menu.view", "Ver Menú", "Ver items del menú", "menu"));
            allPermissions.add(createPermission(permissionRepository, "menu.edit", "Editar Menú", "Modificar items del menú", "menu"));
            allPermissions.add(createPermission(permissionRepository, "menu.create", "Crear Items Menú", "Crear nuevos items", "menu"));
            allPermissions.add(createPermission(permissionRepository, "menu.delete", "Eliminar Items Menú", "Eliminar items del menú", "menu"));
            
            // Permisos de Categorías
            allPermissions.add(createPermission(permissionRepository, "categories.view", "Ver Categorías", "Ver listado de categorías", "categories"));
            allPermissions.add(createPermission(permissionRepository, "categories.manage", "Gestionar Categorías", "Administrar categorías", "categories"));
            
            // Permisos de Usuarios
            allPermissions.add(createPermission(permissionRepository, "users.view", "Ver Usuarios", "Ver listado de usuarios", "users"));
            allPermissions.add(createPermission(permissionRepository, "users.manage", "Gestionar Usuarios", "Crear y modificar usuarios", "users"));
            
            // Permisos de Empleados
            allPermissions.add(createPermission(permissionRepository, "employees.view", "Ver Empleados", "Ver listado de empleados", "employees"));
            allPermissions.add(createPermission(permissionRepository, "employees.manage", "Gestionar Empleados", "Administrar empleados", "employees"));
            
            // Permisos de Perfiles
            allPermissions.add(createPermission(permissionRepository, "profiles.view", "Ver Perfiles", "Ver listado de perfiles", "profiles"));
            allPermissions.add(createPermission(permissionRepository, "profiles.manage", "Gestionar Perfiles", "Administrar perfiles de seguridad", "profiles"));
            
            // Permisos de Cargos/Positions
            allPermissions.add(createPermission(permissionRepository, "positions.view", "Ver Cargos", "Ver listado de cargos", "positions"));
            allPermissions.add(createPermission(permissionRepository, "positions.manage", "Gestionar Cargos", "Administrar cargos laborales", "positions"));
            
            // Permisos de Clientes
            allPermissions.add(createPermission(permissionRepository, "clients.view", "Ver Clientes", "Ver listado de clientes", "clients"));
            allPermissions.add(createPermission(permissionRepository, "clients.manage", "Gestionar Clientes", "Administrar clientes", "clients"));
            
            // Permisos de Mesas
            allPermissions.add(createPermission(permissionRepository, "tables.view", "Ver Mesas", "Ver listado de mesas", "tables"));
            allPermissions.add(createPermission(permissionRepository, "tables.manage", "Gestionar Mesas", "Administrar mesas", "tables"));
            
            // Permisos de Reportes
            allPermissions.add(createPermission(permissionRepository, "reports.view", "Ver Reportes", "Acceder a reportes del sistema", "reports"));
            allPermissions.add(createPermission(permissionRepository, "reports.export", "Exportar Reportes", "Exportar reportes a Excel/PDF", "reports"));

            // ============================================
            // 2. CREAR PERFIL DE ADMINISTRADOR
            // ============================================
            System.out.println("👤 Creando perfil de Administrador...");
            
            Profile adminProfile = createProfile(
                profileRepository, 
                "ADMIN", 
                "Administrador", 
                "Acceso completo al sistema. Puede gestionar perfiles, cargos, usuarios y todas las operaciones.",
                allPermissions
            );

            // ============================================
            // 3. CREAR USUARIO ADMINISTRADOR INICIAL
            // ============================================
            System.out.println("🔐 Creando usuario administrador inicial...");
            
            User adminUser = createUser(
                userRepository,
                "admin",
                "admin123",
                "Administrador del Sistema",
                adminProfile
            );

            // ============================================
            System.out.println("✅ Inicialización completada exitosamente!");
            System.out.println("\n📊 RESUMEN DE CARGA:");
            System.out.println("  • " + permissionRepository.count() + " permisos creados");
            System.out.println("  • " + profileRepository.count() + " perfil creado (ADMIN)");
            System.out.println("  • " + userRepository.count() + " usuario creado");
            System.out.println("\n🔐 CREDENCIALES DE ACCESO INICIAL:");
            System.out.println("  Usuario: admin");
            System.out.println("  Contraseña: admin123");
            System.out.println("  PIN: 1234");
            System.out.println("\n🎯 FLUJO RECOMENDADO:");
            System.out.println("  1. Crear PERFILES (Mesero, Cajero, etc.) → /admin/profiles");
            System.out.println("  2. Crear CARGOS (Positions) → /admin/positions");
            System.out.println("  3. Crear EMPLEADOS + USUARIOS → /admin/employees");
            System.out.println("\n📚 ARQUITECTURA:");
            System.out.println("  • CARGO (Position):  Lo que la persona HACE físicamente");
            System.out.println("  • PERFIL (Profile):  Lo que la persona PUEDE hacer en el sistema");
            System.out.println("  • USUARIO (User):    QUIÉN está usando el sistema");
        };
    }

    private Permission createPermission(PermissionRepository repo, String code, String name, 
                                       String description, String module) {
        Permission permission = new Permission();
        permission.setCode(code);
        permission.setName(name);
        permission.setDescription(description);
        permission.setModule(module);
        permission.setActive(true);
        return repo.save(permission);
    }

    private Profile createProfile(ProfileRepository repo, String code, String name, 
                                 String description, Set<Permission> permissions) {
        Profile profile = new Profile();
        profile.setCode(code);
        profile.setName(name);
        profile.setDescription(description);
        profile.setPermissions(permissions);
        profile.setActive(true);
        return repo.save(profile);
    }

    private User createUser(UserRepository repo, String username, String password, 
                           String fullName, Profile profile) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setFullName(fullName);
        user.setProfile(profile);
        user.setActive(true);
        return repo.save(user);
    }
}
