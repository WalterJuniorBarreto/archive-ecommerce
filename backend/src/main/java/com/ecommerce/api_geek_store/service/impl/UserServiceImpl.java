package com.ecommerce.api_geek_store.service.impl;

import com.ecommerce.api_geek_store.api.dto.AdminUserRequest;
import com.ecommerce.api_geek_store.api.dto.ChangePasswordRequest;
import com.ecommerce.api_geek_store.api.dto.UserProfileUpdateRequest;
import com.ecommerce.api_geek_store.api.dto.UserResponse;
import com.ecommerce.api_geek_store.domain.model.AuthProvider;
import com.ecommerce.api_geek_store.domain.model.User;
import com.ecommerce.api_geek_store.domain.repository.UserRepository;
import com.ecommerce.api_geek_store.exception.InvalidPasswordException;
import com.ecommerce.api_geek_store.exception.ResourceNotFoundException;
import com.ecommerce.api_geek_store.service.UserService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ecommerce.api_geek_store.api.mapper.UserMapper;

import javax.management.relation.Role;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                           UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request, UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));


        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new InvalidPasswordException("La contraseña antigua es incorrecta");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

    }


    @Override
    public UserResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return userMapper.toResponse(user);

    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> findAll(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
        return userMapper.toResponse(user);
    }



    @Override
    @Transactional
    public UserResponse create(AdminUserRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("El email ya existe");
        }

        if (request.password() == null || request.password().length() < 6) {
            throw new IllegalArgumentException("La contraseña es obligatoria y debe tener mín. 6 caracteres");
        }

        User user = new User();
        user.setNombre(request.nombre());
        user.setApellido(request.apellido());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        // 🚨 CORRECCIÓN FINAL DE ROL 🚨
        // Convertimos el Enum a String con .name() o pasamos el String directo
        String rolSolicitado = String.valueOf(request.rol());

        if ("ADMIN".equalsIgnoreCase(rolSolicitado) || "ROLE_ADMIN".equalsIgnoreCase(rolSolicitado)) {
            // Guardamos el String exacto que espera Spring Security
            user.setRol("ROLE_ADMIN");
        } else {
            // Cualquier otra cosa es User
            user.setRol("ROLE_USER");
        }

        user.setAuthProvider(AuthProvider.LOCAL);
        user.setEnabled(true);

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse update(Long id, AdminUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new IllegalArgumentException("El email está en uso.");
            }
            user.setEmail(request.email());
        }

        user.setNombre(request.nombre());
        user.setApellido(request.apellido());

        if (request.password() != null && !request.password().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        // 🚨 CORRECCIÓN FINAL DE ROL EN UPDATE 🚨
        if (request.rol() != null) {
            String rolSolicitado = String.valueOf(request.rol());
            if ("ADMIN".equalsIgnoreCase(rolSolicitado) || "ROLE_ADMIN".equalsIgnoreCase(rolSolicitado)) {
                user.setRol("ROLE_ADMIN");
            } else {
                user.setRol("ROLE_USER");
            }
        }

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        userRepository.delete(user);
    }



    @Override
    @Transactional
    public UserResponse updateProfile(String email, UserProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if(request.nombre() != null) user.setNombre(request.nombre());
        if(request.apellido() != null) user.setApellido(request.apellido());
        if(request.dni() != null) user.setDni(request.dni());
        if(request.telefono() != null) user.setTelefono(request.telefono());
        if(request.genero() != null) user.setGenero(request.genero());
        if(request.fechaNacimiento() != null) user.setFechaNacimiento(request.fechaNacimiento());


        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }


}