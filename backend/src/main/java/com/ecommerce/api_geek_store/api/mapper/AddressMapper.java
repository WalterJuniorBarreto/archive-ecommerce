package com.ecommerce.api_geek_store.api.mapper;

import com.ecommerce.api_geek_store.api.dto.AddressRequest;
import com.ecommerce.api_geek_store.api.dto.AddressResponse;
import com.ecommerce.api_geek_store.domain.model.Address;
import org.springframework.stereotype.Component;

@Component
public class AddressMapper {

    public AddressResponse toResponse(Address address) {
        if (address == null) return null;
        return new AddressResponse(
                address.getId(),
                address.getAlias(),
                address.getDepartamento(),
                address.getProvincia(),
                address.getDistrito(),
                address.getDireccion(),
                address.getReferencia(),
                address.getCodigoPostal()
        );
    }

    public Address toEntity(AddressRequest request) {
        if (request == null) return null;
        Address address = new Address();
        address.setAlias(request.alias());
        address.setDepartamento(request.departamento());
        address.setProvincia(request.provincia());
        address.setDistrito(request.distrito());
        address.setDireccion(request.direccion());
        address.setReferencia(request.referencia());
        address.setCodigoPostal(request.codigoPostal());
        return address;
    }
}