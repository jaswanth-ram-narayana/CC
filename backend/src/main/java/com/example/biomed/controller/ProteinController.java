package com.example.biomed.controller;

import com.example.biomed.model.ProteinRequest;
import com.example.biomed.model.ProteinResult;
import com.example.biomed.service.ProteinService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/protein")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class ProteinController {

    private final ProteinService proteinService;

    public ProteinController(ProteinService proteinService) {
        this.proteinService = proteinService;
    }

    @PostMapping("/predict")
    public ResponseEntity<?> predictStructure(@RequestBody ProteinRequest request) {
        try {
            return ResponseEntity.ok(proteinService.predictStructure(request));
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/sample")
    public ResponseEntity<Map<String, String>> getSampleProtein() {
        Map<String, String> sample = new HashMap<>();
        sample.put("sequence", "MKTIIALSYIFCLVFADYKDDDDK");
        return ResponseEntity.ok(sample);
    }
}
