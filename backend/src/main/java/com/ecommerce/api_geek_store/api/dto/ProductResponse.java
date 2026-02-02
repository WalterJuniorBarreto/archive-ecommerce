package com.ecommerce.api_geek_store.api.dto;


import java.math.BigDecimal;
import java.util.List;



public record ProductResponse(
        Long id,
        String nombre,
        String descripcion,
        BigDecimal precio,
        Integer descuento,
        BigDecimal precioFinal,     // Argumento 6
        String imagenUrl,           // Argumento 7
        List<String> images,        // Argumento 8
        Long categoryId,            // Argumento 9
        String categoryName,        // Argumento 10
        Long brandId,               // Argumento 11
        String brandName,           // Argumento 12
        String genero,              // Argumento 13
        Boolean featured,           // Argumento 14
        List<VariantResponse> variantes, // Argumento 15
        Integer totalStock          // Argumento 16
) {
    public record VariantResponse(
            Long id,
            String color,
            String colorHex,
            String talla,
            Integer stock
    ) {}
}