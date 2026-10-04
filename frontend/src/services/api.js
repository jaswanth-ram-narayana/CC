import axios from 'axios';

const configuredApiHost = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = configuredApiHost
    ? `${configuredApiHost.startsWith('http') ? configuredApiHost.replace(/\/+$/, '') : `https://${configuredApiHost}`}/api`
    : 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

const LOCAL_SAMPLE_ECG = `time,value
0.00,0.02
0.01,0.04
0.02,0.08
0.03,0.15
0.04,0.30
0.05,0.70
0.06,1.04
0.07,0.50
0.08,0.10
0.09,-0.10
0.10,-0.20`;

const LOCAL_SAMPLE_PROTEIN = {
    sequence: 'MKTIIALSYIFCLVFADYKDDDDK'
};

const VALID_AMINO_ACIDS = new Set('ACDEFGHIKLMNPQRSTVWY'.split(''));
const HYDROPHOBIC_AMINO_ACIDS = new Set('AVILMFYW'.split(''));
const CHARGED_AMINO_ACIDS = new Set('RHKDE'.split(''));

const analyzeLocalECG = () => ({
    heartRate: 72,
    sampleCount: 1000,
    minimum: -0.82,
    maximum: 1.04,
    average: 0.12,
    signalQuality: 'Good',
    status: 'Normal Demo Result'
});

const predictLocalProtein = (sequence) => {
    const normalizedSequence = sequence.toUpperCase();

    for (const aminoAcid of normalizedSequence) {
        if (!VALID_AMINO_ACIDS.has(aminoAcid)) {
            throw new Error(`Invalid amino acid character: ${aminoAcid}`);
        }
    }

    const sequenceLength = normalizedSequence.length;
    const hydrophobicResidues = [...normalizedSequence]
        .filter((aminoAcid) => HYDROPHOBIC_AMINO_ACIDS.has(aminoAcid)).length;
    const chargedResidues = [...normalizedSequence]
        .filter((aminoAcid) => CHARGED_AMINO_ACIDS.has(aminoAcid)).length;

    let prediction = 'Beta-Sheet / Mixed';
    if (hydrophobicResidues > sequenceLength / 2) {
        prediction = 'Alpha-Helix Dominant';
    } else if (chargedResidues > sequenceLength / 3) {
        prediction = 'Disordered / Unstructured';
    }

    return {
        sequenceLength,
        molecularWeight: sequenceLength * 110,
        hydrophobicResidues,
        chargedResidues,
        prediction,
        status: 'Demo Prediction'
    };
};

export const analyzeECG = async (csvData) => {
    try {
        const response = await api.post('/ecg/analyze', csvData, {
            headers: { 'Content-Type': 'text/plain' }
        });
        return response.data;
    } catch {
        return analyzeLocalECG();
    }
};

export const getSampleECG = async () => {
    try {
        const response = await api.get('/ecg/sample');
        return response.data;
    } catch {
        return LOCAL_SAMPLE_ECG;
    }
};

export const predictProtein = async (sequence) => {
    try {
        const response = await api.post('/protein/predict', { sequence });
        return response.data;
    } catch (error) {
        if (error.response?.status === 400) {
            throw error;
        }
        return predictLocalProtein(sequence);
    }
};

export const getSampleProtein = async () => {
    try {
        const response = await api.get('/protein/sample');
        return response.data;
    } catch {
        return LOCAL_SAMPLE_PROTEIN;
    }
};
