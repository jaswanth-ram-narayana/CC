package com.example.biomed.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "public_datasets",
        uniqueConstraints = @UniqueConstraint(columnNames = {"type", "sha256"}))
public class DatasetRecord {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private DatasetType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 500)
    private String sourceUrl;

    @Column(nullable = false, length = 300)
    private String license;

    @Column(nullable = false, length = 500, unique = true)
    private String s3Key;

    @Column(nullable = false)
    private long sizeBytes;

    @Column(nullable = false, length = 64)
    private String sha256;

    @Column(nullable = false, updatable = false)
    private Instant importedAt;

    protected DatasetRecord() {
    }

    public DatasetRecord(
            UUID id,
            DatasetType type,
            String title,
            String sourceUrl,
            String license,
            String s3Key,
            long sizeBytes,
            String sha256) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.sourceUrl = sourceUrl;
        this.license = license;
        this.s3Key = s3Key;
        this.sizeBytes = sizeBytes;
        this.sha256 = sha256;
    }

    @PrePersist
    void setImportedAt() {
        if (importedAt == null) {
            importedAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public DatasetType getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public String getLicense() {
        return license;
    }

    public String getS3Key() {
        return s3Key;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public String getSha256() {
        return sha256;
    }

    public Instant getImportedAt() {
        return importedAt;
    }
}
