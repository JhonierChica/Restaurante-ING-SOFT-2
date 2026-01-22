package com.restaurante.restaurantbackend.config;

import com.restaurante.restaurantbackend.modules.categories.model.Category;
import com.restaurante.restaurantbackend.modules.categories.repository.CategoryRepository;
import com.restaurante.restaurantbackend.modules.employees.model.Employee;
import com.restaurante.restaurantbackend.modules.employees.repository.EmployeeRepository;
import com.restaurante.restaurantbackend.modules.menu.model.MenuItem;
import com.restaurante.restaurantbackend.modules.menu.repository.MenuItemRepository;
import com.restaurante.restaurantbackend.modules.users.model.User;
import com.restaurante.restaurantbackend.modules.users.model.UserRole;
import com.restaurante.restaurantbackend.modules.users.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            EmployeeRepository employeeRepository,
            CategoryRepository categoryRepository,
            MenuItemRepository menuItemRepository) {
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

            // Crear empleados de prueba si no existen
            if (employeeRepository.count() == 0) {
                User admin = userRepository.findByUsername("admin").orElse(null);
                User manager = userRepository.findByUsername("manager").orElse(null);
                User waiter = userRepository.findByUsername("waiter").orElse(null);
                User chef = userRepository.findByUsername("chef").orElse(null);
                User cashier = userRepository.findByUsername("cashier").orElse(null);

                if (admin != null) {
                    Employee empAdmin = new Employee();
                    empAdmin.setUser(admin);
                    empAdmin.setDocumentNumber("12345678");
                    empAdmin.setPhone("+57 300 123 4567");
                    empAdmin.setAddress("Calle 123 #45-67");
                    empAdmin.setHireDate(LocalDate.of(2023, 1, 1));
                    empAdmin.setSalary(new BigDecimal("5000000"));
                    empAdmin.setPosition("Administrador General");
                    empAdmin.setDepartment("Administración");
                    empAdmin.setActive(true);
                    employeeRepository.save(empAdmin);
                }

                if (manager != null) {
                    Employee empManager = new Employee();
                    empManager.setUser(manager);
                    empManager.setDocumentNumber("23456789");
                    empManager.setPhone("+57 300 234 5678");
                    empManager.setAddress("Carrera 45 #67-89");
                    empManager.setHireDate(LocalDate.of(2023, 2, 1));
                    empManager.setSalary(new BigDecimal("4000000"));
                    empManager.setPosition("Gerente de Operaciones");
                    empManager.setDepartment("Administración");
                    empManager.setActive(true);
                    employeeRepository.save(empManager);
                }

                if (waiter != null) {
                    Employee empWaiter = new Employee();
                    empWaiter.setUser(waiter);
                    empWaiter.setDocumentNumber("34567890");
                    empWaiter.setPhone("+57 300 345 6789");
                    empWaiter.setAddress("Avenida 10 #20-30");
                    empWaiter.setHireDate(LocalDate.of(2023, 3, 1));
                    empWaiter.setSalary(new BigDecimal("1500000"));
                    empWaiter.setPosition("Mesero Senior");
                    empWaiter.setDepartment("Servicio");
                    empWaiter.setActive(true);
                    employeeRepository.save(empWaiter);
                }

                if (chef != null) {
                    Employee empChef = new Employee();
                    empChef.setUser(chef);
                    empChef.setDocumentNumber("45678901");
                    empChef.setPhone("+57 300 456 7890");
                    empChef.setAddress("Diagonal 15 #25-35");
                    empChef.setHireDate(LocalDate.of(2023, 1, 15));
                    empChef.setSalary(new BigDecimal("3500000"));
                    empChef.setPosition("Chef Ejecutivo");
                    empChef.setDepartment("Cocina");
                    empChef.setActive(true);
                    employeeRepository.save(empChef);
                }

                if (cashier != null) {
                    Employee empCashier = new Employee();
                    empCashier.setUser(cashier);
                    empCashier.setDocumentNumber("56789012");
                    empCashier.setPhone("+57 300 567 8901");
                    empCashier.setAddress("Transversal 20 #30-40");
                    empCashier.setHireDate(LocalDate.of(2023, 4, 1));
                    empCashier.setSalary(new BigDecimal("2000000"));
                    empCashier.setPosition("Cajero Principal");
                    empCashier.setDepartment("Caja");
                    empCashier.setActive(true);
                    employeeRepository.save(empCashier);
                }

                System.out.println("✅ Empleados iniciales creados correctamente");
            }

            // Crear categorías de prueba si no existen
            if (categoryRepository.count() == 0) {
                Category cat1 = new Category();
                cat1.setName("Entradas");
                cat1.setDescription("Deliciosas entradas para comenzar tu comida");
                cat1.setDisplayOrder(1);
                cat1.setActive(true);
                categoryRepository.save(cat1);

                Category cat2 = new Category();
                cat2.setName("Platos Principales");
                cat2.setDescription("Platos fuertes y sustanciosos");
                cat2.setDisplayOrder(2);
                cat2.setActive(true);
                categoryRepository.save(cat2);

                Category cat3 = new Category();
                cat3.setName("Postres");
                cat3.setDescription("Dulces y deliciosos postres");
                cat3.setDisplayOrder(3);
                cat3.setActive(true);
                categoryRepository.save(cat3);

                Category cat4 = new Category();
                cat4.setName("Bebidas");
                cat4.setDescription("Refrescantes bebidas");
                cat4.setDisplayOrder(4);
                cat4.setActive(true);
                categoryRepository.save(cat4);

                Category cat5 = new Category();
                cat5.setName("Ensaladas");
                cat5.setDescription("Frescas y saludables ensaladas");
                cat5.setDisplayOrder(5);
                cat5.setActive(true);
                categoryRepository.save(cat5);

                System.out.println("✅ Categorías iniciales creadas correctamente");
            }

            // Crear ítems del menú de prueba si no existen
            if (menuItemRepository.count() == 0) {
                Category entradas = categoryRepository.findByName("Entradas").orElse(null);
                Category platos = categoryRepository.findByName("Platos Principales").orElse(null);
                Category postres = categoryRepository.findByName("Postres").orElse(null);
                Category bebidas = categoryRepository.findByName("Bebidas").orElse(null);
                Category ensaladas = categoryRepository.findByName("Ensaladas").orElse(null);

                if (entradas != null) {
                    MenuItem item1 = new MenuItem();
                    item1.setName("Bruschetta");
                    item1.setDescription("Pan tostado con tomate, albahaca y aceite de oliva");
                    item1.setPrice(new BigDecimal("15000"));
                    item1.setCategory(entradas);
                    item1.setPreparationTime(10);
                    item1.setIsVegetarian(true);
                    item1.setCalories(180);
                    item1.setAvailable(true);
                    menuItemRepository.save(item1);

                    MenuItem item2 = new MenuItem();
                    item2.setName("Aros de Cebolla");
                    item2.setDescription("Crujientes aros de cebolla empanizados");
                    item2.setPrice(new BigDecimal("12000"));
                    item2.setCategory(entradas);
                    item2.setPreparationTime(15);
                    item2.setIsVegetarian(true);
                    item2.setCalories(250);
                    item2.setAvailable(true);
                    menuItemRepository.save(item2);
                }

                if (platos != null) {
                    MenuItem item3 = new MenuItem();
                    item3.setName("Bandeja Paisa");
                    item3.setDescription("Plato típico colombiano con carne, chicharrón, frijoles, arroz, huevo y aguacate");
                    item3.setPrice(new BigDecimal("35000"));
                    item3.setCategory(platos);
                    item3.setPreparationTime(25);
                    item3.setCalories(850);
                    item3.setAvailable(true);
                    menuItemRepository.save(item3);

                    MenuItem item4 = new MenuItem();
                    item4.setName("Lasagna Vegetariana");
                    item4.setDescription("Lasagna con verduras frescas y queso");
                    item4.setPrice(new BigDecimal("28000"));
                    item4.setCategory(platos);
                    item4.setPreparationTime(30);
                    item4.setIsVegetarian(true);
                    item4.setCalories(450);
                    item4.setAvailable(true);
                    menuItemRepository.save(item4);
                }

                if (postres != null) {
                    MenuItem item5 = new MenuItem();
                    item5.setName("Tiramisu");
                    item5.setDescription("Postre italiano con café y mascarpone");
                    item5.setPrice(new BigDecimal("18000"));
                    item5.setCategory(postres);
                    item5.setPreparationTime(5);
                    item5.setIsVegetarian(true);
                    item5.setCalories(380);
                    item5.setAvailable(true);
                    menuItemRepository.save(item5);

                    MenuItem item6 = new MenuItem();
                    item6.setName("Brownie con Helado");
                    item6.setDescription("Brownie de chocolate caliente con helado de vainilla");
                    item6.setPrice(new BigDecimal("16000"));
                    item6.setCategory(postres);
                    item6.setPreparationTime(8);
                    item6.setIsVegetarian(true);
                    item6.setCalories(520);
                    item6.setAvailable(true);
                    menuItemRepository.save(item6);
                }

                if (bebidas != null) {
                    MenuItem item7 = new MenuItem();
                    item7.setName("Limonada Natural");
                    item7.setDescription("Refrescante limonada con hielo");
                    item7.setPrice(new BigDecimal("8000"));
                    item7.setCategory(bebidas);
                    item7.setPreparationTime(5);
                    item7.setIsVegan(true);
                    item7.setIsVegetarian(true);
                    item7.setCalories(90);
                    item7.setAvailable(true);
                    menuItemRepository.save(item7);

                    MenuItem item8 = new MenuItem();
                    item8.setName("Café Americano");
                    item8.setDescription("Café negro preparado al momento");
                    item8.setPrice(new BigDecimal("5000"));
                    item8.setCategory(bebidas);
                    item8.setPreparationTime(3);
                    item8.setIsVegan(true);
                    item8.setIsVegetarian(true);
                    item8.setCalories(5);
                    item8.setAvailable(true);
                    menuItemRepository.save(item8);
                }

                if (ensaladas != null) {
                    MenuItem item9 = new MenuItem();
                    item9.setName("Ensalada César");
                    item9.setDescription("Lechuga romana, pollo, crutones y aderezo césar");
                    item9.setPrice(new BigDecimal("22000"));
                    item9.setCategory(ensaladas);
                    item9.setPreparationTime(10);
                    item9.setIsGlutenFree(true);
                    item9.setCalories(320);
                    item9.setAvailable(true);
                    menuItemRepository.save(item9);

                    MenuItem item10 = new MenuItem();
                    item10.setName("Ensalada Griega");
                    item10.setDescription("Tomate, pepino, cebolla, aceitunas y queso feta");
                    item10.setPrice(new BigDecimal("20000"));
                    item10.setCategory(ensaladas);
                    item10.setPreparationTime(8);
                    item10.setIsVegetarian(true);
                    item10.setIsGlutenFree(true);
                    item10.setCalories(180);
                    item10.setAvailable(true);
                    menuItemRepository.save(item10);
                }

                System.out.println("✅ Ítems del menú iniciales creados correctamente");
            }

            System.out.println("\n🎉 ¡Sistema inicializado correctamente! El restaurante está listo para operar.");
        };
    }
}
