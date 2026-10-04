package com.example.biomed.controller;

import com.example.biomed.model.DatasetMetadata;
import com.example.biomed.model.DatasetType;
import com.example.biomed.service.DatasetService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/datasets")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class DatasetController {

    private final DatasetService datasetService;
    private final String importToken;

    public DatasetController(
            DatasetService datasetService,
            @Value("${app.datasets.import-token:}") String importToken) {
        this.datasetService = datasetService;
        this.importToken = importToken;
    }

    @GetMapping
    public List<DatasetMetadata> listDatasets() {
        return datasetService.list();
    }

    @PostMapping
    public ResponseEntity<DatasetMetadata> importDataset(
            @RequestHeader(value = "X-Dataset-Import-Token", required = false) String providedToken,
            @RequestParam DatasetType type,
            @RequestParam String title,
            @RequestParam String sourceUrl,
            @RequestParam String license,
            @RequestParam MultipartFile file) {
        requireImportToken(providedToken);
        DatasetMetadata imported = datasetService.importDataset(type, title, sourceUrl, license, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(imported);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Void> downloadDataset(@PathVariable UUID id) {
        URI downloadUrl = datasetService.createDownloadUrl(id);
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, downloadUrl.toString())
                .build();
    }

    private void requireImportToken(String providedToken) {
        byte[] expected = importToken.getBytes(StandardCharsets.UTF_8);
        byte[] provided = providedToken == null
                ? new byte[0]
                : providedToken.getBytes(StandardCharsets.UTF_8);
        if (expected.length == 0 || !MessageDigest.isEqual(expected, provided)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "A valid dataset import token is required.");
        }
    }
}
