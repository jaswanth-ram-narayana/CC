package com.example.biomed.service;

import com.example.biomed.model.ECGResult;
import org.springframework.stereotype.Service;

@Service
public class ECGService {

    public ECGResult analyzeECG(String data) {
        // Mock analysis for demonstration
        // A real app would parse the CSV and run DSP algorithms
        return new ECGResult(
            72, 
            1000, 
            -0.82, 
            1.04, 
            0.12, 
            "Good", 
            "Normal Demo Result"
        );
    }
}
