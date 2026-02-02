package com.ecommerce.api_geek_store.api.dto;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record OrderRequest(
        @NotEmpty(message = "El pedido debe tener ítems")
        List<@Valid OrderItemRequest> items,

        @NotNull(message = "La dirección de envío es obligatoria")
        @Valid // Validamos los campos anidados
        ShippingAddressRequest direccion,
        String metodoPago,     // "YAPE_QR" o "MERCADO_PAGO"
        String codOperacion// <--- NUEVO CAMPO
) {}

