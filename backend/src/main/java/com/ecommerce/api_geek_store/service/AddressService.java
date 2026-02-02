package com.ecommerce.api_geek_store.service;

import com.ecommerce.api_geek_store.api.dto.AddressRequest;
import com.ecommerce.api_geek_store.api.dto.AddressResponse;

import java.util.List;

public interface AddressService {
    List<AddressResponse> getMyAddresses(String email);
    AddressResponse createAddress(String email, AddressRequest request);
    void deleteAddress(String email, Long addressId);
    AddressResponse updateAddress(String email, Long addressId, AddressRequest request);
}