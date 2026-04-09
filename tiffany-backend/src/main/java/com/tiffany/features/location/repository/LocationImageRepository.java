package com.tiffany.features.location.repository;

import com.tiffany.features.location.models.LocationImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LocationImageRepository extends JpaRepository<LocationImage, UUID> {
    List<LocationImage> findByLocationId(UUID locationId);
}
