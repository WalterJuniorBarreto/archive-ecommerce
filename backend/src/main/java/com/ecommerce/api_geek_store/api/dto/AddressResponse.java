package com.ecommerce.api_geek_store.api.dto;

public record AddressResponse(
        Long id,
        String alias,
        String departamento,
        String provincia,
        String distrito,
        String direccion,
        String referencia,
        String codigoPostal
) {}