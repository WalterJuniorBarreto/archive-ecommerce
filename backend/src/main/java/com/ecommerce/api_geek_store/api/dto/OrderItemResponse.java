package com.ecommerce.api_geek_store.api.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long id,
        Integer cantidad,
        BigDecimal precioUnitario,
        Long productId,
        String productName,
        String color, // <--- NUEVO: Para mostrar en el historial
        String talla
) {}