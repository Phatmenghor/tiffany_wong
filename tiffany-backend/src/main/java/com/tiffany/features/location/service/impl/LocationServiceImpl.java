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
        log.info("Creating location: userId={}, isDefault={}", currentUser.getId(), request.getIsDefault());

        Location address = addressMapper.toEntity(request);
        address.setUserId(currentUser.getId());

        if (request.getIsDefault() || !hasDefaultAddress(currentUser.getId())) {
            synchronized (currentUser.getId().toString().intern()) {
                if (request.getIsDefault() || !hasDefaultAddress(currentUser.getId())) {
                    clearDefaultForUser(currentUser.getId());
                    address.setAsDefault();
                }
            }
        }

        Location savedAddress = addressRepository.save(address);
        log.info("Location created: id={}, userId={}, isDefault={}",
                savedAddress.getId(), currentUser.getId(), savedAddress.getIsDefault());

        return addressMapper.toResponse(savedAddress);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<LocationResponse> getAllAddresses(LocationFilterRequest filter) {
        log.info("Fetching locations: page={}, size={}, userId={}, search={}",
                filter.getPageNo(), filter.getPageSize(), filter.getUserId(), filter.getSearch());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Location> addressPage = addressRepository.findAllWithFilters(
                filter.getUserId(),
                filter.getSearch(),
                pageable
        );

        log.info("Locations fetched: total={}, pages={}, current={}",
                addressPage.getTotalElements(), addressPage.getTotalPages(), addressPage.getNumber() + 1);

        return addressMapper.toPaginationResponse(addressPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationResponse> getMyAddressesList() {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Fetching my addresses (list): userId={}", currentUser.getId());

        List<Location> addresses = addressRepository
                .findByUserIdAndIsDeletedFalseOrderByIsDefaultDescCreatedAtDesc(currentUser.getId());

        log.info("My addresses fetched: userId={}, count={}", currentUser.getId(), addresses.size());
        return addressMapper.toResponseList(addresses);
    }

    @Override
    @Transactional(readOnly = true)
    public LocationResponse getAddressById(UUID id) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Fetching location: id={}, userId={}", id, currentUser.getId());

        Location address = addressRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Location not found: id={}", id);
                    return new NotFoundException("Address not found");
                });

        if (!address.getUserId().equals(currentUser.getId())) {
            log.warn("Unauthorized location access: id={}, requesterId={}, ownerId={}",
                    id, currentUser.getId(), address.getUserId());
            throw new ValidationException("You can only access your own addresses");
        }

        log.info("Location fetched: id={}, userId={}", id, currentUser.getId());
        return addressMapper.toResponse(address);
    }

    @Override
    public LocationResponse updateAddress(UUID id, LocationUpdateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Updating location: id={}, userId={}", id, currentUser.getId());

        Location address = addressRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Location not found for update: id={}", id);
                    return new NotFoundException("Address not found");
                });

        if (!address.getUserId().equals(currentUser.getId())) {
            log.warn("Unauthorized location update: id={}, requesterId={}, ownerId={}",
                    id, currentUser.getId(), address.getUserId());
            throw new ValidationException("You can only update your own addresses");
        }

        addressMapper.updateEntity(request, address);

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultForUser(currentUser.getId());
            address.setAsDefault();
            log.info("Location set as default: id={}, userId={}", id, currentUser.getId());
        } else if (Boolean.FALSE.equals(request.getIsDefault())) {
            address.unsetDefault();
        }

        addressRepository.save(address);
        log.info("Location updated: id={}, userId={}", id, currentUser.getId());

        return addressMapper.toResponse(address);
    }

    @Override
    public LocationResponse deleteAddress(UUID id) {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Deleting location: id={}, userId={}", id, currentUser.getId());

        Location address = addressRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Location not found for delete: id={}", id);
                    return new NotFoundException("Address not found");
                });

        if (!address.getUserId().equals(currentUser.getId())) {
            log.warn("Unauthorized location delete: id={}, requesterId={}, ownerId={}",
                    id, currentUser.getId(), address.getUserId());
            throw new ValidationException("You can only delete your own addresses");
        }

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());

        address.softDelete();
        addressRepository.save(address);

        if (wasDefault) {
            List<Location> remainingAddresses = addressRepository
                    .findByUserIdAndIsDeletedFalseOrderByIsDefaultDescCreatedAtDesc(currentUser.getId());
            if (!remainingAddresses.isEmpty()) {
                Location nextDefault = remainingAddresses.get(0);
                nextDefault.setAsDefault();
                addressRepository.save(nextDefault);
                log.info("Next default location promoted: id={}, userId={}", nextDefault.getId(), currentUser.getId());
            } else {
                log.info("No remaining locations to promote: userId={}", currentUser.getId());
            }
        }

        log.info("Location deleted: id={}, userId={}", id, currentUser.getId());
        return addressMapper.toResponse(address);
    }

    @Override
    @Transactional(readOnly = true)
    public LocationResponse getDefaultAddress() {
        User currentUser = securityUtils.getCurrentUser();
        log.info("Fetching default location: userId={}", currentUser.getId());

        Location defaultAddress = addressRepository
                .findByUserIdAndIsDefaultTrueAndIsDeletedFalse(currentUser.getId())
                .orElseThrow(() -> {
                    log.warn("No default location found: userId={}", currentUser.getId());
                    return new NotFoundException("No default address found");
                });

        log.info("Default location fetched: id={}, userId={}", defaultAddress.getId(), currentUser.getId());
        return addressMapper.toResponse(defaultAddress);
    }

    private boolean hasDefaultAddress(UUID userId) {
        return addressRepository.findByUserIdAndIsDefaultTrueAndIsDeletedFalse(userId).isPresent();
    }

    private void clearDefaultForUser(UUID userId) {
        addressRepository.clearDefaultForUser(userId);
    }
}
