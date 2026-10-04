import React, { useState } from 'react';
import { analyzeECG, getSampleECG } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Upload, Download, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

const ECG_WARNING_SIGNS = [
    { pattern: /chest\s+(pain|discomfort|pressure|tightness|squeezing)/i, label: 'Chest pain, discomfort, or pressure' },
    { pattern: /(difficulty|trouble|severe shortness of)\s+breath|shortness of breath/i, label: 'Difficulty breathing or shortness of breath' },
    { pattern: /\b(faint(?:ed|ing)?|passed out|collapse[ds]?|unresponsive)\b/i, label: 'Fainting, collapse, or unresponsiveness' },
    { pattern: /\b(blue|bluish|grey|gray)\s+(lips|face)\b/i, label: 'Blue or grey lips / face' },
    { pattern: /\b(rapid|irregular|racing)\s+(heartbeat|heart beat|pulse)\b/i, label: 'Rapid or irregular heartbeat' },
    { pattern: /cold sweat|breaking out in a sweat/i, label: 'Cold sweat' },
    { pattern: /\b(lightheaded|light-headed|dizzy)\b/i, label: 'Lightheadedness or dizziness' },
    { pattern: /\b(pain|discomfort)\s+(in\s+)?(one or both\s+)?(arms?|jaw|neck|back|stomach)\b/i, label: 'Pain in an arm, jaw, neck, back, or stomach' }
];

const ECGAnalysis = () => {
    const [csvData, setCsvData] = useState('');
    const [chartData, setChartData] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reportedSymptoms, setReportedSymptoms] = useState('');
    const emergencyMatches = ECG_WARNING_SIGNS.filter(({ pattern }) => pattern.test(reportedSymptoms)).map(({ label }) => label);

    const parseCSV = (csv) => {
        const lines = csv.trim().split('\n');
        const data = [];
        for (let i = 1; i < lines.length; i++) { // Skip header
            const parts = lines[i].split(',');
            if (parts.length === 2) {
                data.push({
                    time: parseFloat(parts[0]),
                    value: parseFloat(parts[1])
                });
            }
        }
        return data;
    };

    const handleLoadSample = async () => {
        try {
            setError('');
            setLoading(true);
            const sample = await getSampleECG();
            setCsvData(sample);
            setChartData(parseCSV(sample));
            setResult(null);
        } catch (err) {
            setError('Failed to load sample data.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                setCsvData(text);
                setChartData(parseCSV(text));
                setResult(null);
                setError('');
            };
            reader.readAsText(file);
        }
    };

    const handleAnalyze = async () => {
        if (!csvData) {
            setError('Please load data first.');
            return;
        }
        try {
            setError('');
            setLoading(true);
            const res = await analyzeECG(csvData);
            setResult(res);
        } catch (err) {
            setError('Failed to analyze data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                    <Activity size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Healthcare ECG Analysis</h2>
                    <p className="text-sm text-slate-500">Analyze electrocardiogram data (Demo)</p>
                </div>
            </div>

            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-950"><ShieldAlert size={17}/> Emergency symptom check</div>
                <label htmlFor="ecg-emergency-symptoms" className="mt-2 block text-xs leading-5 text-amber-950">Describe current symptoms, if any. This checks entered words only; it does not interpret the ECG or decide that home care is safe.</label>
                <textarea id="ecg-emergency-symptoms" value={reportedSymptoms} onChange={(e) => setReportedSymptoms(e.target.value)} placeholder="e.g. chest pressure, shortness of breath, fainting" className="mt-2 w-full rounded-md border border-amber-200 bg-white p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300" rows={2}/>
                {emergencyMatches.length ? <div role="alert" className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-red-950"><p className="flex items-center gap-2 text-sm font-bold"><AlertTriangle size={16}/> Emergency care may be needed now</p><ul className="mt-1 list-inside list-disc text-xs leading-5">{emergencyMatches.map((item) => <li key={item}>{item}</li>)}</ul><p className="mt-2 text-xs leading-5">If these symptoms are happening now, call your local emergency number or seek emergency medical care immediately.</p></div> : <p className="mt-2 text-xs leading-5 text-amber-900">{reportedSymptoms.trim() ? 'No listed warning phrase was detected. This cannot rule out an emergency or determine whether hospital care is needed.' : 'No symptom assessment yet. Enter symptoms to check for selected warning signs.'}</p>}
                <div className="mt-3 border-t border-amber-200 pt-3"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-950">Medication guidance</p><p className="mt-1 text-xs leading-5 text-amber-950">This demo cannot recommend medicine from an ECG or symptoms. Use medicines only as prescribed or as directed on their label; ask a clinician or pharmacist before starting or combining medicines. <a className="font-semibold underline" href="https://www.nhs.uk/social-care-and-support/practical-tips-if-you-care-for-someone/medicines-tips-for-carers/" target="_blank" rel="noreferrer">Medicine safety guidance</a>.</p></div>
            </div>

            <div className="mb-5 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700"><b>Important:</b> The current ECG backend returns fixed demonstration values and does not medically interpret uploaded waveforms. ECG results alone cannot diagnose or exclude a heart condition; a clinician must interpret them with symptoms and other tests. <a className="font-semibold text-sky-800 underline" href="https://medlineplus.gov/lab-tests/electrocardiogram/" target="_blank" rel="noreferrer">About ECG limitations</a> · <a className="font-semibold text-sky-800 underline" href="https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack" target="_blank" rel="noreferrer">Heart attack warning signs</a>.</div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <div className="flex flex-wrap gap-3 mb-6">
                <button
                    onClick={handleLoadSample}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    <Download size={16} /> Use Sample Data
                </button>
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50">
                    <Upload size={16} /> Upload CSV
                    <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </label>
                <button
                    onClick={handleAnalyze}
                    disabled={loading || !csvData}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ml-auto"
                >
                    {loading ? 'Processing...' : 'Run ECG Analysis'}
                </button>
            </div>

            {chartData.length > 0 && (
                <div className="mb-6 h-48 w-full bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={12} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {result && (
                <div className="mt-auto">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-800">Analysis Results</h3>
                            <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                Demo / Educational
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded-md shadow-sm border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Heart Rate</p>
                                <p className="text-lg font-bold text-slate-800">{result.heartRate} BPM</p>
                            </div>
                            <div className="bg-white p-3 rounded-md shadow-sm border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Signal Quality</p>
                                <p className="text-lg font-bold text-slate-800">{result.signalQuality}</p>
                            </div>
                            <div className="bg-white p-3 rounded-md shadow-sm border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Max Amplitude</p>
                                <p className="text-lg font-bold text-slate-800">{result.maximum}</p>
                            </div>
                            <div className="bg-white p-3 rounded-md shadow-sm border border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Status</p>
                                <p className="text-lg font-bold text-slate-800">{result.status}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {!result && !chartData.length && (
                <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-2">
                    <Activity size={32} className="opacity-20" />
                    <p className="text-sm">Load data to view waveform</p>
                </div>
            )}
        </div>
    );
};

export default ECGAnalysis;
