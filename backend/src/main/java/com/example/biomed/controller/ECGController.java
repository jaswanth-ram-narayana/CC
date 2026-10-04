package com.example.biomed.controller;

import com.example.biomed.model.ECGResult;
import com.example.biomed.service.ECGService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/ecg")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class ECGController {

    private final ECGService ecgService;

    public ECGController(ECGService ecgService) {
        this.ecgService = ecgService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<ECGResult> analyzeECG(@RequestBody(required = false) String data) {
        return ResponseEntity.ok(ecgService.analyzeECG(data));
    }

    @GetMapping("/sample")
    public ResponseEntity<String> getSampleECG() {
        String sampleData = "time,value\n0.00,0.02\n0.01,0.04\n0.02,0.08\n0.03,0.15\n0.04,0.30\n0.05,0.70\n0.06,1.04\n0.07,0.50\n0.08,0.10\n0.09,-0.10\n0.10,-0.20";
        return ResponseEntity.ok(sampleData);
    }
}
