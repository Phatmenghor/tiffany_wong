package com.tiffany.features.location.service.impl;

import com.tiffany.exception.custom.NotFoundException;
import com.tiffany.exception.custom.ValidationException;
import com.tiffany.features.auth.models.User;
import com.tiffany.features.location.dto.filter.LocationFilterRequest;
import com.tiffany.features.location.dto.request.LocationCreateRequest;
import com.tiffany.features.location.dto.request.LocationImageRequest;
import com.tiffany.features.location.dto.response.LocationResponse;
import com.tiffany.features.location.dto.update.LocationUpdateRequest;
import com.tiffany.features.location.mapper.LocationMapper;
import com.tiffany.features.location.models.Location;
import com.tiffany.features.location.models.LocationImage;
import com.tiffany.features.location.repository.LocationImageRepository;
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
    private final LocationImageRepository locationImageRepository;
    private final LocationMapper addressMapper;
    private final SecurityUtils securityUtils;
    private final PaginationMapper paginationMapper;

    @Override
    public LocationResponse createAddress(LocationCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        log.info("Creating location for user: {}", currentUser.getUserIdentifier());

        // 1. Create and save parent location entity (IGNORE images during mapping)
        Location address = addressMapper.toEntity(request);
        address.setUserId(currentUser.getId());

        // Handle default address logic with synchronization to prevent race conditions
        if (request.getIsDefault() || !hasDefaultAddress(currentUser.getId())) {
            synchronized (currentUser.getId().toString().intern()) {
                if (request.getIsDefault() || !hasDefaultAddress(currentUser.getId())) {
                    clearDefaultForUser(currentUser.getId());
                    address.setAsDefault();
                }
            }
        }

        Location savedAddress = addressRepository.save(address);
        log.info("Location saved with ID: {}", savedAddress.getId());

        // 2. Handle images SEPARATELY after parent is saved
        if (request.getLocationImages() != null && !request.getLocationImages().isEmpty()) {
            handleLocationImages(savedAddress, request.getLocationImages());
            log.info("Images processed for location: {}", savedAddress.getId());
        }

        // 3. Fetch fresh entity from DB to include images
        log.info("Address created successfully for user: {}", currentUser.getUserIdentifier());
        return getAddressById(savedAddress.getId());
    }

    /**
     * Handle location images separately following Product feature pattern.
     * Save images to repository directly, not through parent entity.
     */
    private void handleLocationImages(Location location, List<LocationImageRequest> imageDtos) {
        if (imageDtos == null || imageDtos.isEmpty()) return;

        log.info("Processing {} images for location {}", imageDtos.size(), location.getId());

        List<LocationImage> images = imageDtos.stream()
                .map(imageDto -> {
                    LocationImage image = new LocationImage();
                    image.setLocationId(location.getId()); // Set FK directly
                    image.setImageUrl(imageDto.getImageUrl());
                    return image;
                })
                .toList();

        // Save images to repository SEPARATELY (not through parent)
        locationImageRepository.saveAll(images);
        log.info("Saved {} images for location {}", images.size(), location.getId());
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

        log.info("Updating location {} for user: {}", id, currentUser.getUserIdentifier());

        // 1. Update parent location fields (IGNORE images during mapping)
        addressMapper.updateEntity(request, address);

        // Handle default address logic
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultForUser(currentUser.getId());
            address.setAsDefault();
            log.info("Setting address {} as default", id);
        } else if (Boolean.FALSE.equals(request.getIsDefault())) {
            address.unsetDefault();
        }

        addressRepository.save(address);
        log.info("Location {} updated", id);

        // 2. Handle images SEPARATELY following Product feature pattern
        if (request.getLocationImages() != null) {
            updateLocationImages(address, request.getLocationImages());
        }

        // 3. Fetch fresh entity from DB to return
        log.info("Address updated successfully for user: {}", currentUser.getUserIdentifier());
        return getAddressById(id);
    }

    /**
     * Handle image CRUD operations following Product feature pattern.
     * Process in order: Delete → Update → Create
     */
    private void updateLocationImages(Location location, List<LocationImageRequest> imageDtos) {
        if (imageDtos == null) return;

        log.info("Processing {} image changes for location {}", imageDtos.size(), location.getId());

        // STEP 1: Delete images marked with isDeleted=true
        List<UUID> idsToDelete = imageDtos.stream()
                .filter(dto -> Boolean.TRUE.equals(dto.getIsDeleted()) && dto.getId() != null)
                .map(LocationUpdateRequest.LocationImageRequest::getId)
                .toList();

        if (!idsToDelete.isEmpty()) {
            locationImageRepository.deleteAllById(idsToDelete);
            log.info("Deleted {} images", idsToDelete.size());
        }

        // STEP 2: Update existing images (has ID and not marked deleted)
        List<LocationImage> existingImagesToUpdate = locationImageRepository.findByLocationId(location.getId());
        List<LocationImageRequest> updateRequests = imageDtos.stream()
                .filter(dto -> dto.getId() != null && !Boolean.TRUE.equals(dto.getIsDeleted()))
                .toList();

        for (var updateDto : updateRequests) {
            existingImagesToUpdate.stream()
                    .filter(img -> img.getId().equals(updateDto.getId()))
                    .findFirst()
                    .ifPresent(existingImage -> {
                        existingImage.setImageUrl(updateDto.getImageUrl());
                        locationImageRepository.save(existingImage);
                        log.debug("Updated image {}", updateDto.getId());
                    });
        }
        if (!updateRequests.isEmpty()) {
            log.info("Updated {} images", updateRequests.size());
        }

        // STEP 3: Create new images (no ID)
        List<LocationImage> newImages = imageDtos.stream()
                .filter(dto -> dto.getId() == null && !Boolean.TRUE.equals(dto.getIsDeleted()))
                .map(imageDto -> {
                    LocationImage image = new LocationImage();
                    image.setLocationId(location.getId());
                    image.setImageUrl(imageDto.getImageUrl());
                    return image;
                })
                .toList();

        if (!newImages.isEmpty()) {
            locationImageRepository.saveAll(newImages);
            log.info("Created {} new images", newImages.size());
        }

        log.info("Image processing complete - created: {}, updated: {}, deleted: {}",
            newImages.size(), updateRequests.size(), idsToDelete.size());
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
        int imageCount = address.getLocationImages() != null ? address.getLocationImages().size() : 0;

        log.info("Deleting location {} with {} associated images for user: {}", id, imageCount, currentUser.getUserIdentifier());

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
            } else {
                log.info("No remaining addresses to promote to default");
            }
        }

        log.info("Location deletion completed successfully");

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