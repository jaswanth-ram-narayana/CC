package com.example.biomed.model;

public class ECGResult {
    private int heartRate;
    private int sampleCount;
    private double minimum;
    private double maximum;
    private double average;
    private String signalQuality;
    private String status;

    public ECGResult() {}

    public ECGResult(int heartRate, int sampleCount, double minimum, double maximum, double average, String signalQuality, String status) {
        this.heartRate = heartRate;
        this.sampleCount = sampleCount;
        this.minimum = minimum;
        this.maximum = maximum;
        this.average = average;
        this.signalQuality = signalQuality;
        this.status = status;
    }

    public int getHeartRate() { return heartRate; }
    public void setHeartRate(int heartRate) { this.heartRate = heartRate; }

    public int getSampleCount() { return sampleCount; }
    public void setSampleCount(int sampleCount) { this.sampleCount = sampleCount; }

    public double getMinimum() { return minimum; }
    public void setMinimum(double minimum) { this.minimum = minimum; }

    public double getMaximum() { return maximum; }
    public void setMaximum(double maximum) { this.maximum = maximum; }

    public double getAverage() { return average; }
    public void setAverage(double average) { this.average = average; }

    public String getSignalQuality() { return signalQuality; }
    public void setSignalQuality(String signalQuality) { this.signalQuality = signalQuality; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
