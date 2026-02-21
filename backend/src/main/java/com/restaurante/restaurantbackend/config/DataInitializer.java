package com.restaurante.restaurantbackend.config;

import org.springframework.context.annotation.Configuration;

/**
 * Inicializador de datos básicos del sistema.
 * 
 * NOTA: Debido a que la BD PostgreSQL no tiene tablas de permisos ni relaciones
 * profile_permissions, este inicializador solo crea perfiles básicos.
 * 
 * Los datos completos (cargo, empleado, usuario, etc.) deben cargarse usando
 * el script SQL: backend/sql/datos_iniciales.sql
 */
/**
 * Inicializador de datos básicos del sistema - DESHABILITADO
 * 
 * NOTA: Los datos deben cargarse manualmente usando el script SQL:
 * backend/sql/datos_iniciales.sql
 * 
 * Ejecutar en pgAdmin: psql -U postgres -d mr_panzo_db -f datos_iniciales.sql
 */
@Configuration
public class DataInitializer {

    // DataInitializer deshabilitado - usar script SQL manual
    /*
    @Bean
    CommandLineRunner initDatabase(ProfileRepository profileRepository) {
        
        return args -> {
            System.out.println("⚠️  DataInitializer deshabilitado.");
            System.out.println("⚠️  Ejecuta el script SQL manualmente:");
            System.out.println("     psql -U postgres -d mr_panzo_db -f backend/sql/datos_iniciales.sql");
        };
    }
    */
}
