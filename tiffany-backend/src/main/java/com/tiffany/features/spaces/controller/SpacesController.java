package com.tiffany.features.spaces.controller;

import com.tiffany.features.spaces.dto.response.SpacesImageResponse;
import com.tiffany.features.spaces.dto.response.SpacesUploadResponse;
import com.tiffany.features.spaces.service.SpacesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/spaces")
@RequiredArgsConstructor
@Tag(name = "Spaces Storage", description = "Image upload and delete via DigitalOcean Spaces")
@Slf4j
public class SpacesController {

    private final SpacesService spacesService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image — stored under tiffany_furniture/yyyy-MM-dd/")
    public ResponseEntity<SpacesUploadResponse> upload(
            @RequestPart("file") MultipartFile file
    ) {
        log.info("Image upload request: filename={}, size={} bytes", file.getOriginalFilename(), file.getSize());
        SpacesUploadResponse response = spacesService.upload(file);
        log.info("Image uploaded: key={}", response.getKey());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/object")
    @Operation(summary = "Delete image by object key")
    public ResponseEntity<Void> deleteByKey(@RequestParam String key) {
        log.info("Image delete request: key={}", key);
        spacesService.deleteByKey(key);
        log.info("Image deleted: key={}", key);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/logs")
    @Operation(summary = "Get all uploaded image logs")
    public ResponseEntity<List<SpacesImageResponse>> getLogs() {
        log.info("Image logs requested");
        List<SpacesImageResponse> logs = spacesService.getLogs();
        log.info("Image logs retrieved: count={}", logs.size());
        return ResponseEntity.ok(logs);
    }
}
