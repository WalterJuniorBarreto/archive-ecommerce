package com.ecommerce.api_geek_store.api.dto;
import java.time.LocalDate;


public record UserResponse(
        Long id,
        String nombre,
        String apellido,
        String email,
        String rol,
        String dni,
        String telefono,
        String genero,
        LocalDate fechaNacimiento,
        String authProvider
) { }