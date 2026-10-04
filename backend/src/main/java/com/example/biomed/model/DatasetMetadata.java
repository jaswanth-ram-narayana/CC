package com.example.biomed.model;

import java.time.Instant;
import java.util.UUID;

public record DatasetMetadata(
        UUID id,
        DatasetType type,
        String title,
        String sourceUrl,
        String license,
        long sizeBytes,
        String sha256,
        Instant importedAt) {

    public static DatasetMetadata from(DatasetRecord record) {
        return new DatasetMetadata(
                record.getId(),
                record.getType(),
                record.getTitle(),
                record.getSourceUrl(),
                record.getLicense(),
                record.getSizeBytes(),
                record.getSha256(),
                record.getImportedAt());
    }
}
