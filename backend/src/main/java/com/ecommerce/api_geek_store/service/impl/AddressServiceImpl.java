package com.ecommerce.api_geek_store.service.impl;

import com.ecommerce.api_geek_store.api.dto.AddressRequest;
import com.ecommerce.api_geek_store.api.dto.AddressResponse;
import com.ecommerce.api_geek_store.api.mapper.AddressMapper;
import com.ecommerce.api_geek_store.domain.model.Address;
import com.ecommerce.api_geek_store.domain.model.User;
import com.ecommerce.api_geek_store.domain.repository.AddressRepository;
import com.ecommerce.api_geek_store.domain.repository.UserRepository;
import com.ecommerce.api_geek_store.exception.ResourceNotFoundException;
import com.ecommerce.api_geek_store.service.AddressService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressServiceImpl implements AddressService {

    private static final Logger log = LoggerFactory.getLogger(AddressServiceImpl.class);

    private static final int MAX_ADDRESSES_PER_USER = 10;

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;

    public AddressServiceImpl(AddressRepository addressRepository,
                              UserRepository userRepository,
                              AddressMapper addressMapper) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.addressMapper = addressMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getMyAddresses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return addressRepository.findByUserId(user.getId())
                .stream()
                .map(addressMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressResponse createAddress(String email, AddressRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));


        long count = addressRepository.countByUserId(user.getId());
        if (count >= MAX_ADDRESSES_PER_USER) {
            log.warn("Usuario {} intentó exceder el límite de direcciones ({})", email, MAX_ADDRESSES_PER_USER);
            throw new IllegalArgumentException("Has alcanzado el límite máximo de " + MAX_ADDRESSES_PER_USER + " direcciones permitidas.");
        }

        Address address = addressMapper.toEntity(request);
        address.setUser(user);

        Address savedAddress = addressRepository.save(address);
        log.info("Nueva dirección creada para usuario: {}", email);

        return addressMapper.toResponse(savedAddress);
    }

    @Override
    @Transactional
    public void deleteAddress(String email, Long addressId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada"));

        if (!address.getUser().getId().equals(user.getId())) {
            log.warn("ALERTA DE SEGURIDAD: Usuario {} intentó borrar dirección ajena ID {}", email, addressId);
            throw new AccessDeniedException("No tienes permiso para eliminar esta dirección.");
        }

        addressRepository.delete(address);
        log.info("Dirección ID {} eliminada por usuario {}", addressId, email);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(String email, Long addressId, AddressRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada"));

        if (!address.getUser().getId().equals(user.getId())) {
            log.warn("ALERTA DE SEGURIDAD: Usuario {} intentó modificar dirección ajena ID {}", email, addressId);
            throw new AccessDeniedException("No tienes permiso para editar esta dirección.");
        }

        address.setAlias(request.alias());
        address.setDepartamento(request.departamento());
        address.setProvincia(request.provincia());
        address.setDistrito(request.distrito());
        address.setDireccion(request.direccion());
        address.setReferencia(request.referencia());
        address.setCodigoPostal(request.codigoPostal());

        Address updatedAddress = addressRepository.save(address);
        log.info("Dirección ID {} actualizada por usuario {}", addressId, email);

        return addressMapper.toResponse(updatedAddress);
    }
}