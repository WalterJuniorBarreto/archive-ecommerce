package com.ecommerce.api_geek_store.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminUserRequest(
        @NotBlank String nombre,
        @NotBlank String apellido,
        @NotBlank @Email String email,
        @Size(min = 8, max = 32) String password,
        @Pattern(regexp = "ADMIN|USER", message = "El rol debe ser ADMIN o USER")
        String rol
) {}