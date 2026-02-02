package com.ecommerce.api_geek_store.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordResetRequest(
        @NotBlank String email,
        @NotBlank String code,
        @NotBlank @Size(min = 8) String newPassword
) {}