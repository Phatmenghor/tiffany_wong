package com.tiffany.features.location.service;
import com.tiffany.features.location.dto.filter.LocationFilterRequest;
import com.tiffany.features.location.dto.request.LocationCreateRequest;
import com.tiffany.features.location.dto.response.LocationResponse;
import com.tiffany.features.location.dto.update.LocationUpdateRequest;
import com.tiffany.shared.dto.PaginationResponse;

import java.util.List;
import java.util.UUID;

public interface LocationService {
    com.tiffany.features.location.dto.response.LocationResponse createAddress(LocationCreateRequest request);
    
    PaginationResponse<LocationResponse> getAllAddresses(LocationFilterRequest filter);
    
    List<LocationResponse> getMyAddressesList();

    LocationResponse getAddressById(UUID id);
    LocationResponse updateAddress(UUID id, LocationUpdateRequest request);
    LocationResponse deleteAddress(UUID id);
    LocationResponse getDefaultAddress();
}