package com.ecommerce.api_geek_store.api.controller;

import com.ecommerce.api_geek_store.api.dto.*;
import com.ecommerce.api_geek_store.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("Nuevo intento de registro: {}", registerRequest.email());
        return new ResponseEntity<>(authService.register(registerRequest), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Intento de login para usuario: {}", loginRequest.email());
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @GetMapping("/confirm")
    public ResponseEntity<Map<String, String>> confirm(@RequestParam("token") String token) {
        authService.confirmToken(token);
        return ResponseEntity.ok(Map.of("message", "Cuenta confirmada exitosamente"));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@RequestBody @Valid GoogleLoginRequest request) {
        log.info("Intento de Login via Google OAuth");
        return ResponseEntity.ok(authService.loginWithGoogle(request.token()));
    }

    @PostMapping("/password/recover")
    public ResponseEntity<Map<String, String>> recoverPassword(@Valid @RequestBody PasswordRecoverRequest request) {
        log.info("Solicitud de recuperación de contraseña para: {}", request.email());
        authService.sendRecoveryCode(request.email());
        return ResponseEntity.ok(Map.of("message", "Código enviado al correo"));
    }

    @PostMapping("/verify-recovery-code")
    public ResponseEntity<Map<String, String>> verifyRecoveryCode(@Valid @RequestBody CodeVerificationRequest request) {
        authService.validateRecoveryCode(request.email(), request.code());
        return ResponseEntity.ok(Map.of("message", "Código válido"));
    }

    @PostMapping("/password/reset")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        log.info("Restablecimiento de contraseña solicitado para: {}", request.email());
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
    }
}