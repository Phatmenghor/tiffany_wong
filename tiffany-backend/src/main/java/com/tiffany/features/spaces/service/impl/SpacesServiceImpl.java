package com.tiffany.features.spaces.service.impl;

import com.tiffany.config.spaces.SpacesProperties;
import com.tiffany.features.spaces.dto.response.SpacesImageResponse;
import com.tiffany.features.spaces.dto.response.SpacesUploadResponse;
import com.tiffany.features.spaces.model.SpacesImage;
import com.tiffany.features.spaces.repository.SpacesImageRepository;
import com.tiffany.features.spaces.service.SpacesService;
import com.tiffany.features.spaces.util.StorageKeyUtil;
import com.tiffany.features.spaces.util.StorageNameUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpacesServiceImpl implements SpacesService {

    private final S3Client spacesS3Client;
    private final SpacesProperties spacesProperties;
    private final SpacesImageRepository spacesImageRepository;

    @Override
    @Transactional
    public SpacesUploadResponse upload(MultipartFile file) {
        String key = StorageKeyUtil.key(StorageNameUtil.generateName());
        log.info("Uploading image: filename={}, size={} bytes, key={}",
                file.getOriginalFilename(), file.getSize(), key);

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            log.error("Failed to read file bytes: filename={}, error={}", file.getOriginalFilename(), e.getMessage());
            throw new RuntimeException("Failed to read uploaded file: " + e.getMessage());
        }

        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";

        try {
            spacesS3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(spacesProperties.getBucket())
                            .key(key)
                            .contentType(contentType)
                            .contentLength((long) bytes.length)
                            .acl(ObjectCannedACL.PUBLIC_READ)
                            .build(),
                    RequestBody.fromBytes(bytes)
            );
        } catch (Exception e) {
            log.error("S3 upload failed: key={}, bucket={}, error={}", key, spacesProperties.getBucket(), e.getMessage());
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }

        String url = spacesProperties.getCdnBaseUrl() + "/" + key;

        spacesImageRepository.save(SpacesImage.builder()
                .objectKey(key)
                .url(url)
                .originalFilename(file.getOriginalFilename())
                .fileSize((long) bytes.length)
                .build());

        log.info("Image uploaded: key={}, url={}", key, url);
        return SpacesUploadResponse.builder().key(key).url(url).build();
    }

    @Override
    @Transactional
    public void deleteByKey(String key) {
        log.info("Deleting image: key={}", key);

        try {
            spacesS3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(spacesProperties.getBucket())
                    .key(key)
                    .build());
        } catch (Exception e) {
            log.warn("S3 delete failed (continuing with DB cleanup): key={}, error={}", key, e.getMessage());
        }

        spacesImageRepository.deleteByObjectKey(key);
        log.info("Image deleted: key={}", key);
    }

    @Override
    public List<SpacesImageResponse> getLogs() {
        log.info("Fetching image upload logs");
        List<SpacesImageResponse> logs = spacesImageRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
        log.info("Image logs fetched: count={}", logs.size());
        return logs;
    }

    private SpacesImageResponse toResponse(SpacesImage image) {
        return SpacesImageResponse.builder()
                .id(image.getId())
                .objectKey(image.getObjectKey())
                .url(image.getUrl())
                .originalFilename(image.getOriginalFilename())
                .fileSize(image.getFileSize())
                .createdAt(image.getCreatedAt())
                .build();
    }
}
