package com.example.biomed.model;

public class ProteinRequest {
    private String sequence;

    public ProteinRequest() {}

    public ProteinRequest(String sequence) {
        this.sequence = sequence;
    }

    public String getSequence() {
        return sequence;
    }

    public void setSequence(String sequence) {
        this.sequence = sequence;
    }
}
