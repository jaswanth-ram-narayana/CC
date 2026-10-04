package com.example.biomed.repository;

import com.example.biomed.model.DatasetRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
import com.example.biomed.model.DatasetType;

public interface DatasetRepository extends JpaRepository<DatasetRecord, UUID> {
    List<DatasetRecord> findTop100ByOrderByImportedAtDesc();
    boolean existsByTypeAndSha256(DatasetType type, String sha256);
}
