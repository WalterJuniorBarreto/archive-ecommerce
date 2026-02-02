package com.ecommerce.api_geek_store.api.mapper;

import com.ecommerce.api_geek_store.api.dto.RegisterRequest;
import com.ecommerce.api_geek_store.api.dto.UserResponse;
import com.ecommerce.api_geek_store.domain.model.User;
import com.ecommerce.api_geek_store.domain.model.AuthProvider;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(RegisterRequest request) {
        if (request == null) return null;

        User user = new User();
        user.setNombre(request.nombre());
        user.setApellido(request.apellido());
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setAuthProvider(AuthProvider.LOCAL);
        return user;
    }

    public UserResponse toResponse(User user) {
        if (user == null) return null;

        return new UserResponse(
                user.getId(),
                user.getNombre(),
                user.getApellido(),
                user.getEmail(),
                user.getRol(),
                user.getDni(),
                user.getTelefono(),
                user.getGenero(),
                user.getFechaNacimiento(),
                user.getAuthProvider() != null ? user.getAuthProvider().name() : AuthProvider.LOCAL.name()
        );
    }
}