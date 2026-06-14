package com.tiffany.features.main.service.impl;

import com.tiffany.exception.custom.NotFoundException;
import com.tiffany.features.main.dto.filter.BannerFilterRequest;
import com.tiffany.features.main.dto.filter.BannerAllFilterRequest;
import com.tiffany.features.main.dto.request.BannerCreateRequest;
import com.tiffany.features.main.dto.response.BannerResponse;
import com.tiffany.features.main.dto.update.BannerUpdateRequest;
import com.tiffany.features.main.mapper.BannerMapper;
import com.tiffany.features.main.models.Banner;
import com.tiffany.features.main.repository.BannerRepository;
import com.tiffany.features.main.service.BannerService;
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
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;
    private final PaginationMapper paginationMapper;

    @Override
    public BannerResponse createBanner(BannerCreateRequest request) {
        log.info("Creating banner");
        Banner banner = bannerMapper.toEntity(request);
        Banner savedBanner = bannerRepository.save(banner);
        log.info("Banner created: id={}", savedBanner.getId());
        return bannerMapper.toResponse(savedBanner);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<BannerResponse> getAllBanners(BannerFilterRequest filter) {
        log.info("Fetching banners: page={}, size={}, status={}, search={}",
                filter.getPageNo(), filter.getPageSize(), filter.getStatus(), filter.getSearch());

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        Page<Banner> bannerPage = bannerRepository.findAllWithFilters(
                filter.getStatus(),
                filter.getSearch() != null ? filter.getSearch().trim() : null,
                pageable
        );

        log.info("Banners fetched: total={}, pages={}, current={}",
                bannerPage.getTotalElements(), bannerPage.getTotalPages(), bannerPage.getNumber() + 1);

        return bannerMapper.toPaginationResponse(bannerPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponse> getAllItemBanners(BannerAllFilterRequest filter) {
        log.info("Fetching all banners (list): status={}, search={}", filter.getStatus(), filter.getSearch());

        List<Banner> banners = bannerRepository.findAllWithFilters(
                filter.getStatus(),
                filter.getSearch() != null ? filter.getSearch().trim() : null,
                PaginationUtils.createSort(filter.getSortBy(), filter.getSortDirection())
        );

        log.info("All banners fetched: count={}", banners.size());
        return bannerMapper.toResponseList(banners);
    }

    @Override
    @Transactional(readOnly = true)
    public BannerResponse getBannerById(UUID id) {
        log.info("Fetching banner: id={}", id);
        Banner banner = bannerRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Banner not found: id={}", id);
                    return new NotFoundException("Banner not found");
                });
        log.info("Banner fetched: id={}", id);
        return bannerMapper.toResponse(banner);
    }

    @Override
    public BannerResponse updateBanner(UUID id, BannerUpdateRequest request) {
        log.info("Updating banner: id={}", id);
        Banner banner = bannerRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Banner not found for update: id={}", id);
                    return new NotFoundException("Banner not found");
                });

        bannerMapper.updateEntity(request, banner);
        Banner updatedBanner = bannerRepository.save(banner);

        log.info("Banner updated: id={}", id);
        return bannerMapper.toResponse(updatedBanner);
    }

    @Override
    public BannerResponse deleteBanner(UUID id) {
        log.info("Deleting banner: id={}", id);
        Banner banner = bannerRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Banner not found for delete: id={}", id);
                    return new NotFoundException("Banner not found");
                });

        banner.softDelete();
        banner = bannerRepository.save(banner);

        log.info("Banner deleted: id={}", id);
        return bannerMapper.toResponse(banner);
    }
}
