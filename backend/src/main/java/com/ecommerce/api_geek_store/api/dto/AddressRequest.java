package com.ecommerce.api_geek_store.api.dto;

import jakarta.validation.constraints.NotBlank;

public record AddressRequest(
        @NotBlank String alias,
        @NotBlank String departamento,
        @NotBlank String provincia,
        @NotBlank String distrito,
        @NotBlank String direccion,
        String referencia, // Opcional, sin @NotBlank
        @NotBlank String codigoPostal
) {}