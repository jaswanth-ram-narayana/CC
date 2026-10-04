package com.example.biomed.model;

public class ProteinResult {
    private int sequenceLength;
    private double molecularWeight;
    private int hydrophobicResidues;
    private int chargedResidues;
    private String prediction;
    private String status;

    public ProteinResult() {}

    public ProteinResult(int sequenceLength, double molecularWeight, int hydrophobicResidues, int chargedResidues, String prediction, String status) {
        this.sequenceLength = sequenceLength;
        this.molecularWeight = molecularWeight;
        this.hydrophobicResidues = hydrophobicResidues;
        this.chargedResidues = chargedResidues;
        this.prediction = prediction;
        this.status = status;
    }

    public int getSequenceLength() { return sequenceLength; }
    public void setSequenceLength(int sequenceLength) { this.sequenceLength = sequenceLength; }

    public double getMolecularWeight() { return molecularWeight; }
    public void setMolecularWeight(double molecularWeight) { this.molecularWeight = molecularWeight; }

    public int getHydrophobicResidues() { return hydrophobicResidues; }
    public void setHydrophobicResidues(int hydrophobicResidues) { this.hydrophobicResidues = hydrophobicResidues; }

    public int getChargedResidues() { return chargedResidues; }
    public void setChargedResidues(int chargedResidues) { this.chargedResidues = chargedResidues; }

    public String getPrediction() { return prediction; }
    public void setPrediction(String prediction) { this.prediction = prediction; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
