package com.example.biomed.service;

import com.example.biomed.model.ProteinRequest;
import com.example.biomed.model.ProteinResult;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class ProteinService {
    
    private static final Set<Character> HYDROPHOBIC = Set.of('A', 'V', 'I', 'L', 'M', 'F', 'Y', 'W');
    private static final Set<Character> CHARGED = Set.of('R', 'H', 'K', 'D', 'E');
    private static final Set<Character> VALID_AMINO_ACIDS = Set.of(
            'A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 
            'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y'
    );

    public ProteinResult predictStructure(ProteinRequest request) {
        String seq = request.getSequence().toUpperCase();
        
        // Validation
        if (seq.isEmpty()) {
            throw new IllegalArgumentException("Protein sequence cannot be empty.");
        }
        for (char c : seq.toCharArray()) {
            if (!VALID_AMINO_ACIDS.contains(c)) {
                throw new IllegalArgumentException("Invalid amino acid character: " + c);
            }
        }

        int length = seq.length();
        int hydrophobicCount = 0;
        int chargedCount = 0;
        
        for (char c : seq.toCharArray()) {
            if (HYDROPHOBIC.contains(c)) hydrophobicCount++;
            if (CHARGED.contains(c)) chargedCount++;
        }
        
        // Very basic mock prediction logic
        String prediction;
        if (hydrophobicCount > length / 2) {
            prediction = "Alpha-Helix Dominant";
        } else if (chargedCount > length / 3) {
            prediction = "Disordered / Unstructured";
        } else {
            prediction = "Beta-Sheet / Mixed";
        }
        
        // Approximate molecular weight: 110 Da per amino acid
        double mw = length * 110.0;
        
        return new ProteinResult(
            length,
            mw,
            hydrophobicCount,
            chargedCount,
            prediction,
            "Demo Prediction"
        );
    }
}
