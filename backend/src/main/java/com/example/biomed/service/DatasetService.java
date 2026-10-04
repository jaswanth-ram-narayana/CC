package com.example.biomed.service;

import com.example.biomed.model.DatasetMetadata;
import com.example.biomed.model.DatasetRecord;
import com.example.biomed.model.DatasetType;
import com.example.biomed.repository.DatasetRepository;
import org.springframework.dao.DataAccessException;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class DatasetService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".zip", ".gz", ".fa", ".fasta");

    private final DatasetRepository datasetRepository;
    private final ObjectProvider<S3Client> s3ClientProvider;
    private final ObjectProvider<S3Presigner> s3PresignerProvider;
    private final String bucketName;
    private final long maxFileBytes;

    public DatasetService(
            DatasetRepository datasetRepository,
            ObjectProvider<S3Client> s3ClientProvider,
            ObjectProvider<S3Presigner> s3PresignerProvider,
            @Value("${app.aws.s3.bucket-name:}") String bucketName,
            @Value("${app.datasets.max-file-bytes}") long maxFileBytes) {
        this.datasetRepository = datasetRepository;
        this.s3ClientProvider = s3ClientProvider;
        this.s3PresignerProvider = s3PresignerProvider;
        this.bucketName = bucketName;
        this.maxFileBytes = maxFileBytes;
    }

    public List<DatasetMetadata> list() {
        return datasetRepository.findTop100ByOrderByImportedAtDesc()
                .stream()
                .map(DatasetMetadata::from)
                .toList();
    }

    public DatasetMetadata importDataset(
            DatasetType type,
            String title,
            String sourceUrl,
            String license,
            MultipartFile file) {
        if (bucketName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "S3 storage is not configured.");
        }
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dataset file is empty.");
        }
        if (file.getSize() > maxFileBytes) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "Dataset exceeds the configured upload limit.");
        }

        String cleanTitle = requireText(title, "title", 200);
        String cleanSourceUrl = requireHttpsUrl(type, sourceUrl);
        String cleanLicense = requireText(license, "license", 300);
        String fileName = safeFileName(file.getOriginalFilename());
        UUID id = UUID.randomUUID();
        String objectKey = "datasets/" + type.name().toLowerCase() + "/" + id + "/" + fileName;
        Path temporaryFile = null;
        Throwable failure = null;

        try {
            temporaryFile = Files.createTempFile("biomed-dataset-", ".upload");
            file.transferTo(temporaryFile);
            String sha256 = calculateSha256(temporaryFile);
            long sizeBytes = Files.size(temporaryFile);
            if (datasetRepository.existsByTypeAndSha256(type, sha256)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "This dataset has already been imported.");
            }

            S3Client s3Client = requireS3Client();
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .contentType(file.getContentType() == null
                                    ? "application/octet-stream"
                                    : file.getContentType())
                            .build(),
                    RequestBody.fromFile(temporaryFile));

            DatasetRecord record = new DatasetRecord(
                    id,
                    type,
                    cleanTitle,
                    cleanSourceUrl,
                    cleanLicense,
                    objectKey,
                    sizeBytes,
                    sha256);
            try {
                return DatasetMetadata.from(datasetRepository.save(record));
            } catch (DataAccessException exception) {
                try {
                    s3Client.deleteObject(DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .build());
                } catch (RuntimeException cleanupFailure) {
                    exception.addSuppressed(cleanupFailure);
                }
                throw exception;
            }
        } catch (IOException exception) {
            failure = exception;
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not read or hash the dataset file.",
                    exception);
        } catch (RuntimeException exception) {
            failure = exception;
            throw exception;
        } finally {
            if (temporaryFile != null) {
                try {
                    Files.deleteIfExists(temporaryFile);
                } catch (IOException exception) {
                    if (failure != null) {
                        failure.addSuppressed(exception);
                    } else {
                        throw new ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Could not remove the temporary dataset file.",
                                exception);
                    }
                }
            }
        }
    }

    public URI createDownloadUrl(UUID id) {
        if (bucketName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "S3 storage is not configured.");
        }
        DatasetRecord record = datasetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dataset not found."));
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(record.getS3Key())
                .build();
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .getObjectRequest(getObjectRequest)
                .build();
        PresignedGetObjectRequest signedRequest = requireS3Presigner().presignGetObject(presignRequest);
        return URI.create(signedRequest.url().toString());
    }

    private S3Client requireS3Client() {
        S3Client client = s3ClientProvider.getIfAvailable();
        if (client == null) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "S3 storage is not configured.");
        }
        return client;
    }

    private S3Presigner requireS3Presigner() {
        S3Presigner presigner = s3PresignerProvider.getIfAvailable();
        if (presigner == null) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "S3 storage is not configured.");
        }
        return presigner;
    }

    private static String requireText(String value, String fieldName, int maxLength) {
        if (value == null || value.isBlank() || value.length() > maxLength) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    fieldName + " is required and must be at most " + maxLength + " characters.");
        }
        return value.trim();
    }

    private static String requireHttpsUrl(DatasetType type, String value) {
        try {
            URI uri = URI.create(requireText(value, "sourceUrl", 500));
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(Locale.ROOT);
            boolean allowedHost = switch (type) {
                case ECG -> host.equals("physionet.org") || host.endsWith(".physionet.org");
                case PROTEIN -> host.equals("uniprot.org") || host.endsWith(".uniprot.org");
            };
            if (!"https".equalsIgnoreCase(uri.getScheme()) || !allowedHost) {
                throw new IllegalArgumentException("Invalid HTTPS URL");
            }
            return uri.toString();
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "sourceUrl must be a valid HTTPS URL.",
                    exception);
        }
    }

    private static String safeFileName(String originalFilename) {
        String fileName = originalFilename == null ? "" : Path.of(originalFilename).getFileName().toString();
        String safeName = fileName.replaceAll("[^A-Za-z0-9._-]", "_");
        String lowerName = safeName.toLowerCase(Locale.ROOT);
        if (safeName.isBlank()
                || safeName.length() > 150
                || ALLOWED_EXTENSIONS.stream().noneMatch(lowerName::endsWith)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid dataset file name.");
        }
        return safeName;
    }

    private static String calculateSha256(Path file) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream input = new DigestInputStream(Files.newInputStream(file), digest)) {
                input.transferTo(java.io.OutputStream.nullOutputStream());
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available in this Java runtime.", exception);
        }
    }
}
