package com.tiffany.features.setting.service;

import com.tiffany.features.setting.dto.response.ImageDto;
import com.tiffany.features.setting.dto.response.ImageResponse;
import com.tiffany.features.setting.dto.request.ImageUploadRequest;

import java.util.UUID;


public interface ImageService {

    ImageDto uploadImage(ImageUploadRequest request);

    ImageResponse getImageById(UUID id);

    void deleteImage(UUID id);
}