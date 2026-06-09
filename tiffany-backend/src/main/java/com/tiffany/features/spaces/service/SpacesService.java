package com.tiffany.features.spaces.service;

import com.tiffany.features.spaces.dto.response.SpacesImageResponse;
import com.tiffany.features.spaces.dto.response.SpacesUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SpacesService {

    SpacesUploadResponse upload(MultipartFile file);

    void deleteByKey(String key);

    List<SpacesImageResponse> getLogs();
}
