package com.ecommerce.api_geek_store.api.dto;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record PaymentRequest(
        @NotNull String token,          // El token seguro que genera el Frontend
        @NotNull BigDecimal transactionAmount, // Cuánto cobrar
        @NotNull String paymentMethodId, // "visa", "mastercard", etc.
        @NotNull String payerEmail,      // Quién paga
        @NotNull Integer installments,
        List<PaymentItem> items,
        @NotNull @Valid
        PaymentAddress direccion// Cuotas (por defecto 1)
) {
    public record PaymentItem(
            Long productId,
            Long variantId, // <--- NUEVO CAMPO CRÍTICO
            Integer cantidad
    ) {}
    public record PaymentAddress(
            String calle, String ciudad, String estado, String codigoPostal, String pais
    ) {}
}