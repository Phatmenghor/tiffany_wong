package com.tiffany.features.spaces.repository;

import com.tiffany.features.spaces.model.SpacesImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpacesImageRepository extends JpaRepository<SpacesImage, UUID> {

    List<SpacesImage> findAllByOrderByCreatedAtDesc();

    void deleteByObjectKey(String objectKey);
}
