package com.tiffany.features.spaces.controller;

import com.tiffany.features.spaces.dto.response.SpacesImageResponse;
import com.tiffany.features.spaces.dto.response.SpacesUploadResponse;
import com.tiffany.features.spaces.service.SpacesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/spaces")
@RequiredArgsConstructor
@Tag(name = "Spaces Storage", description = "Image upload and delete via DigitalOcean Spaces")
public class SpacesController {

    private final SpacesService spacesService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image — stored under tiffany_furniture/yyyy-MM-dd/")
    public ResponseEntity<SpacesUploadResponse> upload(
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(spacesService.upload(file));
    }

    @DeleteMapping("/object")
    @Operation(summary = "Delete image by object key")
    public ResponseEntity<Void> deleteByKey(@RequestParam String key) {
        spacesService.deleteByKey(key);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/logs")
    @Operation(summary = "Get all uploaded image logs")
    public ResponseEntity<List<SpacesImageResponse>> getLogs() {
        return ResponseEntity.ok(spacesService.getLogs());
    }
}
