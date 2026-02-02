package com.ecommerce.api_geek_store.service.impl;

import com.ecommerce.api_geek_store.api.dto.*;
import com.ecommerce.api_geek_store.api.mapper.UserMapper;
import com.ecommerce.api_geek_store.domain.model.AuthProvider;
import com.ecommerce.api_geek_store.domain.model.ConfirmationToken;
import com.ecommerce.api_geek_store.domain.model.PasswordResetToken;
import com.ecommerce.api_geek_store.domain.model.User;
import com.ecommerce.api_geek_store.domain.repository.ConfirmationTokenRepository;
import com.ecommerce.api_geek_store.domain.repository.PasswordResetTokenRepository;
import com.ecommerce.api_geek_store.domain.repository.UserRepository;
import com.ecommerce.api_geek_store.exception.EmailAlreadyExistsException;
import com.ecommerce.api_geek_store.exception.ResourceNotFoundException;
import com.ecommerce.api_geek_store.service.AuthService;
import com.ecommerce.api_geek_store.service.jwt.JwtService;
import com.ecommerce.api_geek_store.service.notification.EmailService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Collections;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final UserDetailsService userDetailsService;
    private final ConfirmationTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordTokenRepository;

    @Value("${google.client.id}")
    private String googleClientId;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           UserMapper userMapper, JwtService jwtService,
                           UserDetailsService userDetailsService, ConfirmationTokenRepository tokenRepository, EmailService emailService,
                           PasswordResetTokenRepository passwordResetTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userMapper = userMapper;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordTokenRepository = passwordResetTokenRepository;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        log.info("Iniciando registro de usuario: {}", request.email());

        var existingUserOpt = userRepository.findByEmail(request.email());

        User user;
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.isEnabled()) {
                log.warn("Intento de registro con email ya existente: {}", request.email());
                throw new EmailAlreadyExistsException("El email ya está en uso y confirmado.");
            }
            user = existingUser;
            user.setNombre(request.nombre());
            user.setApellido(request.apellido());
            user.setPassword(passwordEncoder.encode(request.password()));
        } else {
            user = userMapper.toEntity(request);
            user.setApellido(request.apellido());
            user.setPassword(passwordEncoder.encode(request.password()));
            user.setRol("ROLE_USER");
            user.setEnabled(false);
            user.setAuthProvider(AuthProvider.LOCAL);
        }

        User savedUser = userRepository.save(user);

        ConfirmationToken token = new ConfirmationToken(savedUser);
        tokenRepository.save(token);

        emailService.sendVerificationEmail(request.email(), request.nombre(), token.getToken());

        return userMapper.toResponse(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.email())
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));
        if (!user.isEnabled()) {
            log.warn("Intento de login en cuenta no verificada: {}", loginRequest.email());
            throw new DisabledException("Tu cuenta no ha sido verificada. Revisa tu correo.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
            );
        } catch (Exception e) {
            log.warn("Fallo de autenticación para: {}", loginRequest.email());
            throw new BadCredentialsException("Email o contraseña incorrectos");
        }

        var userDetails = userDetailsService.loadUserByUsername(loginRequest.email());
        String jwtToken = jwtService.generateToken(userDetails);

        log.info("Usuario logueado exitosamente: {}", loginRequest.email());
        return new AuthResponse(jwtToken);
    }

    @Transactional
    public String confirmToken(String token) {
        ConfirmationToken confirmationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalStateException("Token inválido"));

        if (confirmationToken.getConfirmedAt() != null) {
            throw new IllegalStateException("El email ya fue confirmado");
        }

        if (confirmationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("El token ha expirado");
        }

        confirmationToken.setConfirmedAt(LocalDateTime.now());
        User user = confirmationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        log.info("Cuenta confirmada: {}", user.getEmail());
        return "confirmado";
    }

    @Override
    public void sendRecoveryCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (user.getAuthProvider() == AuthProvider.GOOGLE) {
            throw new IllegalArgumentException("Tu cuenta está vinculada con Google. Inicia sesión con el botón de Google.");
        }


        SecureRandom secureRandom = new SecureRandom();
        int codeInt = 100000 + secureRandom.nextInt(900000);
        String code = String.valueOf(codeInt);

        passwordTokenRepository.findByUser(user).ifPresent(passwordTokenRepository::delete);

        PasswordResetToken token = new PasswordResetToken(code, user);
        passwordTokenRepository.save(token);

        emailService.sendRecoveryCodeEmail(user.getEmail(), user.getNombre(), code);
        log.info("Código de recuperación enviado a: {}", email);
    }

    @Override
    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        PasswordResetToken token = passwordTokenRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("No hay solicitud pendiente"));

        if (!token.getCode().equals(request.code())) {
            log.warn("Intento fallido de reset password para {}: Código incorrecto", request.email());
            throw new IllegalArgumentException("Código incorrecto");
        }

        if (token.getExpirationTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("El código ha expirado");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        passwordTokenRepository.delete(token);

        log.info("Contraseña restablecida exitosamente para: {}", request.email());
    }

    @Override
    @Transactional
    public AuthResponse loginWithGoogle(String token) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(token);

            if (googleIdToken == null) {
                log.error("Google Token inválido o expirado");
                throw new IllegalArgumentException("Token de Google inválido.");
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            String email = payload.getEmail();

            User user;
            var existingUser = userRepository.findByEmail(email);
            if(existingUser.isPresent()) {
                user = existingUser.get();
            } else {
                log.info("Registrando nuevo usuario vía Google: {}", email);
                user = new User();
                user.setEmail(email);
                user.setNombre((String)payload.get("given_name"));
                user.setApellido((String)payload.get("family_name"));
                user.setRol("ROLE_USER");
                user.setEnabled(true);
                user.setAuthProvider(AuthProvider.GOOGLE);
                userRepository.save(user);
            }

            var userDetails = userDetailsService.loadUserByUsername(email);
            String jwtToken = jwtService.generateToken(userDetails);

            return new AuthResponse(jwtToken);

        } catch (Exception e) {
            log.error("Error crítico en Login Google: {}", e.getMessage());
            throw new BadCredentialsException("Error al autenticar con Google");
        }
    }

    @Override
    public void validateRecoveryCode(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        PasswordResetToken token = passwordTokenRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("No hay solicitud pendiente"));

        if (!token.getCode().equals(code)) {
            throw new IllegalArgumentException("Código incorrecto");
        }

        if (token.getExpirationTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("El código ha expirado");
        }
    }
}