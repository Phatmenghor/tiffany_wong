package com.tiffany.features.location.service.impl;

import com.tiffany.exception.custom.NotFoundException;
import com.tiffany.exception.custom.ValidationException;
import com.tiffany.features.auth.models.User;
import com.tiffany.features.location.dto.filter.LocationFilterRequest;
import com.tiffany.features.location.dto.request.LocationCreateRequest;
import com.tiffany.features.location.dto.response.LocationResponse;
import com.tiffany.features.location.dto.update.LocationUpdateRequest;
import com.tiffany.features.location.mapper.LocationMapper;
import com.tiffany.features.location.models.Location;
import com.tiffany.features.location.models.LocationImage;
import com.tiffany.features.location.repository.LocationRepository;
import com.tiffany.features.location.service.LocationService;
import com.tiffany.security.SecurityUtils;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.mapper.PaginationMapper;
import com.tiffany.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LocationServiceImpl implements LocationService {

    private final LocationRepository addressRepository;
    private final LocationMapper addressMapper;
    private final SecurityUtils securityUtils;
    private final PaginationMapper paginationMapper;

    @Override
    public LocationResponse createAddress(LocationCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Location address = addressMapper.toEntity(request);
        address.setUserId(currentUser.getId());

        // If this is set as default or no default exists, make it default
        if (request.getIsDefault() || !hasDefaultAddress(currentUser.getId())) {
            // Lock on userId to prevent race condition
            synchronized (currentUser.getId().toString().intern()) {
                if (request.getIsDefault() || !hasDefaultAddress(currentUser.getId())) {
                    clearDefaultForUser(currentUser.getId());
                    address.setAsDefault();
                }
            }
        }

        Location savedAddress = addressRepository.save(address);

        // Handle location images - set the location_id on each image after location is saved
        if (request.getLocationImages() != null && !request.getLocationImages().isEmpty()) {
            for (var imageRequest : request.getLocationImages()) {
                var locationImage = new LocationImage();
                locationImage.setLocationId(savedAddress.getId()); // Set the foreign key
                locationImage.setLocation(savedAddress); // Set the relationship for navigation
                locationImage.setImageUrl(imageRequest.getImageUrl());
                savedAddress.getLocationImages().add(locationImage);
            }
            // Save again with images
            savedAddress = addressRepository.save(savedAddress);
        }

        log.info("Address created for user: {}", currentUser.getUserIdentifier());

        return addressMapper.toResponse(savedAddress);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<LocationResponse> getAllAddresses(LocationFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Location> addressPage = addressRepository.findAllWithFilters(
                filter.getUserId(),
                filter.getSearch(),
                pageable
        );
        return addressMapper.toPaginationResponse(addressPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationResponse> getMyAddressesList() {
        User currentUser = securityUtils.getCurrentUser();
        List<Location> addresses = addressRepository
                .findByUserIdAndIsDeletedFalseOrderByIsDefaultDescCreatedAtDesc(currentUser.getId());
        return addressMapper.toResponseList(addresses);
    }

    @Override
    @Transactional(readOnly = true)
    public LocationResponse getAddressById(UUID id) {
        User currentUser = securityUtils.getCurrentUser();
        Location address = addressRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Address not found"));
        
        if (!address.getUserId().equals(currentUser.getId())) {
            throw new ValidationException("You can only access your own addresses");
        }
        
        return addressMapper.toResponse(address);
    }

    @Override
    public LocationResponse updateAddress(UUID id, LocationUpdateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Location address = addressRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Address not found"));

        if (!address.getUserId().equals(currentUser.getId())) {
            throw new ValidationException("You can only update your own addresses");
        }

        // Update fields from request
        addressMapper.updateEntity(request, address);

        // Handle location images - set the location relationship on each image
        if (request.getLocationImages() != null && !request.getLocationImages().isEmpty()) {
            // Clear existing images (cascade delete via JPA)
            address.getLocationImages().clear();

            // Create new LocationImage entities with proper location relationship
            for (var imageRequest : request.getLocationImages()) {
                var locationImage = new LocationImage();
                locationImage.setLocationId(address.getId()); // Set the foreign key
                locationImage.setLocation(address); // Set the relationship for navigation
                locationImage.setImageUrl(imageRequest.getImageUrl());
                address.getLocationImages().add(locationImage);
            }
        }

        // Handle default address logic
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            // Clear default for all other addresses first
            clearDefaultForUser(currentUser.getId());
            // Set this address as default
            address.setAsDefault();
            log.info("Setting address {} as default for user: {}", id, currentUser.getUserIdentifier());
        } else if (Boolean.FALSE.equals(request.getIsDefault())) {
            // Explicitly set as non-default if requested
            address.unsetDefault();
        }

        // Save the updated address
        Location updatedAddress = addressRepository.save(address);
        log.info("Address {} updated for user: {}", id, currentUser.getUserIdentifier());

        return addressMapper.toResponse(updatedAddress);
    }

    @Override
    public LocationResponse deleteAddress(UUID id) {
        User currentUser = securityUtils.getCurrentUser();
        Location address = addressRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Address not found"));

        if (!address.getUserId().equals(currentUser.getId())) {
            throw new ValidationException("You can only delete your own addresses");
        }

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        address.softDelete();
        addressRepository.save(address);

        // If deleted address was default, promote the next address to default
        if (wasDefault) {
            List<Location> remainingAddresses = addressRepository
                    .findByUserIdAndIsDeletedFalseOrderByIsDefaultDescCreatedAtDesc(currentUser.getId());
            if (!remainingAddresses.isEmpty()) {
                Location nextDefault = remainingAddresses.get(0);
                nextDefault.setAsDefault();
                addressRepository.save(nextDefault);
                log.info("Promoted address {} to default after deletion of default address", nextDefault.getId());
            }
        }

        log.info("Address deleted for user: {}", currentUser.getUserIdentifier());
        return addressMapper.toResponse(address);
    }

    @Override
    @Transactional(readOnly = true)
    public LocationResponse getDefaultAddress() {
        User currentUser = securityUtils.getCurrentUser();
        Location defaultAddress = addressRepository
                .findByUserIdAndIsDefaultTrueAndIsDeletedFalse(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("No default address found"));
        
        return addressMapper.toResponse(defaultAddress);
    }
    
    private boolean hasDefaultAddress(UUID userId) {
        return addressRepository.findByUserIdAndIsDefaultTrueAndIsDeletedFalse(userId).isPresent();
    }
    
    private void clearDefaultForUser(UUID userId) {
        addressRepository.clearDefaultForUser(userId);
    }
}