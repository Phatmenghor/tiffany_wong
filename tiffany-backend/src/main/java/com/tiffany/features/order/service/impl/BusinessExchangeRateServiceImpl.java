package com.tiffany.features.order.service.impl;

import com.tiffany.exception.custom.NotFoundException;
import com.tiffany.exception.custom.ValidationException;
import com.tiffany.features.auth.models.User;
import com.tiffany.features.order.dto.filter.BusinessExchangeRateFilterRequest;
import com.tiffany.features.order.dto.request.BusinessExchangeRateCreateRequest;
import com.tiffany.features.order.dto.response.BusinessExchangeRateResponse;
import com.tiffany.features.order.dto.update.BusinessExchangeRateUpdateRequest;
import com.tiffany.features.order.mapper.BusinessExchangeRateMapper;
import com.tiffany.features.order.models.BusinessExchangeRate;
import com.tiffany.features.order.repository.BusinessExchangeRateRepository;
import com.tiffany.features.order.service.BusinessExchangeRateService;
import com.tiffany.security.SecurityUtils;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BusinessExchangeRateServiceImpl implements BusinessExchangeRateService {

    private final BusinessExchangeRateRepository exchangeRateRepository;
    private final BusinessExchangeRateMapper exchangeRateMapper;
    private final com.emenu.shared.mapper.PaginationMapper paginationMapper;

    @Override
    public BusinessExchangeRateResponse createBusinessExchangeRate(BusinessExchangeRateCreateRequest request) {
        log.info("Creating exchange rate: {} KHR per USD", request.getUsdToKhrRate());

        // Deactivate all existing active rates (new rate will be the only ACTIVE one)
        int deactivatedCount = exchangeRateRepository.deactivateAllRates();
        if (deactivatedCount > 0) {
            log.info("Deactivated {} existing active rate(s) when creating new rate", deactivatedCount);
        }

        BusinessExchangeRate exchangeRate = exchangeRateMapper.toEntity(request);
        exchangeRate.setStatus(BusinessExchangeRate.ExchangeRateStatus.ACTIVE); // New rate is always active

        BusinessExchangeRate savedExchangeRate = exchangeRateRepository.save(exchangeRate);

        log.info("Exchange rate created successfully: {} KHR per USD", savedExchangeRate.getUsdToKhrRate());

        return exchangeRateMapper.toResponse(savedExchangeRate);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<BusinessExchangeRateResponse> getAllBusinessExchangeRates(BusinessExchangeRateFilterRequest filter) {
        log.info("Fetching all exchange rates with filters");

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<BusinessExchangeRate> page = exchangeRateRepository.findAllWithFilters(
                filter.getStatus(),
                filter.getSearch(),
                pageable
        );
        return exchangeRateMapper.toPaginationResponse(page, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessExchangeRateResponse getBusinessExchangeRateById(UUID id) {
        log.info("Fetching business exchange rate by ID: {}", id);

        BusinessExchangeRate exchangeRate = findExchangeRateById(id);
        return exchangeRateMapper.toResponse(exchangeRate);
    }

    @Override
    public BusinessExchangeRateResponse updateBusinessExchangeRate(UUID id, BusinessExchangeRateUpdateRequest request) {
        log.info("Updating exchange rate: {}", id);

        BusinessExchangeRate exchangeRate = findExchangeRateById(id);

        // If updating to ACTIVE status, deactivate all other active rates
        if (request.getStatus() != null &&
            request.getStatus() == BusinessExchangeRate.ExchangeRateStatus.ACTIVE) {
            // Deactivate all OTHER active rates (except this one)
            int deactivatedCount = exchangeRateRepository.deactivateAllRatesExcept(id);
            if (deactivatedCount > 0) {
                log.info("Deactivated {} other active rate(s) when activating rate {}", deactivatedCount, id);
            }
        } else if (request.getStatus() != null &&
                   request.getStatus() == BusinessExchangeRate.ExchangeRateStatus.INACTIVE &&
                   exchangeRate.isActive()) {
            // If deactivating the only ACTIVE rate, activate the most recently created INACTIVE rate
            if (exchangeRateRepository.countActiveRates() == 1) {
                Optional<BusinessExchangeRate> nextActiveRate = exchangeRateRepository.findMostRecentInactiveRate();
                if (nextActiveRate.isPresent()) {
                    BusinessExchangeRate rateToActivate = nextActiveRate.get();
                    rateToActivate.activate();
                    exchangeRateRepository.save(rateToActivate);
                    log.info("Activated rate {} when deactivating the only active rate {}", rateToActivate.getId(), id);
                }
            }
        }

        exchangeRateMapper.updateEntity(request, exchangeRate);
        BusinessExchangeRate updatedExchangeRate = exchangeRateRepository.save(exchangeRate);

        log.info("Exchange rate updated successfully: {} - New rate: {} - Status: {}",
                id, updatedExchangeRate.getUsdToKhrRate(), updatedExchangeRate.getStatus());

        return exchangeRateMapper.toResponse(updatedExchangeRate);
    }

    @Override
    public BusinessExchangeRateResponse deleteBusinessExchangeRate(UUID id) {
        log.info("Deleting exchange rate: {}", id);

        BusinessExchangeRate exchangeRate = findExchangeRateById(id);

        // If deleting the only ACTIVE rate, activate the most recent INACTIVE rate
        if (exchangeRate.isActive() && exchangeRateRepository.countActiveRates() == 1) {
            Optional<BusinessExchangeRate> nextActiveRate = exchangeRateRepository.findMostRecentInactiveRate();

            if (nextActiveRate.isEmpty()) {
                throw new ValidationException("Cannot delete the only exchange rate. At least one rate must exist.");
            }

            // Activate the most recent inactive rate
            BusinessExchangeRate rateToActivate = nextActiveRate.get();
            rateToActivate.activate();
            exchangeRateRepository.save(rateToActivate);
            log.info("Activated rate {} when deleting active rate {}", rateToActivate.getId(), id);
        }

        exchangeRate.softDelete();
        exchangeRate = exchangeRateRepository.save(exchangeRate);

        log.info("Exchange rate deleted successfully: {}", id);
        return exchangeRateMapper.toResponse(exchangeRate);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessExchangeRateResponse getActiveRate() {
        log.info("Fetching active exchange rate");

        BusinessExchangeRate activeRate = exchangeRateRepository.findActiveRate()
                .orElseThrow(() -> new NotFoundException("No active exchange rate found"));

        return exchangeRateMapper.toResponse(activeRate);
    }

    // Private helper methods

    private BusinessExchangeRate findExchangeRateById(UUID id) {
        return exchangeRateRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Exchange rate not found"));
    }
}