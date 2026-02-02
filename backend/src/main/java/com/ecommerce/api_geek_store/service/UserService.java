package com.ecommerce.api_geek_store.service;

import com.ecommerce.api_geek_store.api.dto.AdminUserRequest;
import com.ecommerce.api_geek_store.api.dto.ChangePasswordRequest;
import com.ecommerce.api_geek_store.api.dto.UserProfileUpdateRequest;
import com.ecommerce.api_geek_store.api.dto.UserResponse;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserResponse> findAll(Pageable pageable);
    UserResponse findById(Long id);
    UserResponse create(AdminUserRequest request);
    UserResponse update(Long id, AdminUserRequest request);
    void delete(Long id);
    void changePassword(ChangePasswordRequest request, UserDetails userDetails);
    UserResponse getUserProfile(String email);
    UserResponse updateProfile(String email, UserProfileUpdateRequest request);
}