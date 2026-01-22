package com.restaurante.restaurantbackend.config;

import com.restaurante.restaurantbackend.modules.users.model.User;
import com.restaurante.restaurantbackend.modules.users.model.UserRole;
import com.restaurante.restaurantbackend.modules.users.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            // Crear usuarios de prueba si no existen
            if (userRepository.count() == 0) {
                // Usuario Administrador
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@restaurant.com");
                admin.setPassword("admin123");
                admin.setFullName("Administrator");
                admin.setRole(UserRole.ADMIN);
                admin.setActive(true);
                userRepository.save(admin);

                // Usuario Manager
                User manager = new User();
                manager.setUsername("manager");
                manager.setEmail("manager@restaurant.com");
                manager.setPassword("manager123");
                manager.setFullName("Restaurant Manager");
                manager.setRole(UserRole.MANAGER);
                manager.setActive(true);
                userRepository.save(manager);

                // Usuario Mesero
                User waiter = new User();
                waiter.setUsername("waiter");
                waiter.setEmail("waiter@restaurant.com");
                waiter.setPassword("waiter123");
                waiter.setFullName("John Waiter");
                waiter.setRole(UserRole.WAITER);
                waiter.setActive(true);
                userRepository.save(waiter);

                // Usuario Chef
                User chef = new User();
                chef.setUsername("chef");
                chef.setEmail("chef@restaurant.com");
                chef.setPassword("chef123");
                chef.setFullName("Head Chef");
                chef.setRole(UserRole.CHEF);
                chef.setActive(true);
                userRepository.save(chef);

                // Usuario Cajero
                User cashier = new User();
                cashier.setUsername("cashier");
                cashier.setEmail("cashier@restaurant.com");
                cashier.setPassword("cashier123");
                cashier.setFullName("Main Cashier");
                cashier.setRole(UserRole.CASHIER);
                cashier.setActive(true);
                userRepository.save(cashier);

                System.out.println("✅ Usuarios iniciales creados correctamente");
            }
        };
    }
}
