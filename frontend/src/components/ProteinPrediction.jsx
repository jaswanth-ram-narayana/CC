import React, { useMemo, useState } from 'react';
import { predictProtein, getSampleProtein } from '../services/api';
import { AlertCircle, Check, Dna, Download, LoaderCircle, Search } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const AMINO_ACIDS = 'ACDEFGHIKLMNPQRSTVWY'.split('');
const HYDROPHOBIC = new Set('AVILMFYW');
const CHARGED = new Set('RHKDE');

function normalizeSequence(raw) {
    const body = raw.split(/\r?\n/).filter((line) => !line.trim().startsWith('>')).join('');
    const sequence = body.replace(/\s/g, '').toUpperCase();
    if (!sequence) return { error: 'Enter an amino-acid sequence or paste FASTA-formatted sequence data.' };
    const invalidIndex = [...sequence].findIndex((residue) => !AMINO_ACIDS.includes(residue));
    if (invalidIndex !== -1) return { error: `Unrecognized residue “${sequence[invalidIndex]}” at position ${invalidIndex + 1}. Use the 20 standard one-letter amino-acid codes.` };
    return { sequence };
}

function getLabelExplanation(result) {
    if (result.prediction === 'Alpha-Helix Dominant') return `The prototype assigns this label because ${result.hydrophobicResidues} of ${result.sequenceLength} residues (${Math.round(result.hydrophobicResidues / result.sequenceLength * 100)}%) are in its hydrophobic set. This is a simple composition threshold, not a secondary-structure calculation.`;
    if (result.prediction === 'Disordered / Unstructured') return `The prototype assigns this label because ${result.chargedResidues} of ${result.sequenceLength} residues (${Math.round(result.chargedResidues / result.sequenceLength * 100)}%) are in its charged set. Charge fraction alone cannot establish protein disorder.`;
    return `The sequence did not cross either of the prototype’s hydrophobic-majority or charged-fraction thresholds. “Beta-Sheet / Mixed” is a fallback label, not evidence that a beta sheet or 3D fold was predicted.`;
}

const workflow = [
    ['01', 'Enter sequence', 'Paste a one-letter amino-acid sequence or FASTA text.'],
    ['02', 'Validate input', 'FASTA headers and whitespace are removed; residues are checked against the 20 standard codes.'],
    ['03', 'Build profile', 'Count residues, group hydrophobic and charged residues, and estimate molecular mass.'],
    ['04', 'Interpret label', 'Read the prototype’s rule-based label and the reason it was assigned.']
];

export default function ProteinPrediction() {
    const [sequence, setSequence] = useState('');
    const [result, setResult] = useState(null);
    const [analyzedSequence, setAnalyzedSequence] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const sequenceProfile = useMemo(() => {
        if (!result || !analyzedSequence) return null;
        const counts = Object.fromEntries(AMINO_ACIDS.map((residue) => [residue, 0]));
        for (const residue of analyzedSequence) counts[residue] += 1;
        const sortedResidues = AMINO_ACIDS.map((residue) => ({ name: residue, count: counts[residue] })).filter(({ count }) => count > 0).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
        const topResidues = sortedResidues.slice(0, 9);
        const unshownResidueCount = sortedResidues.slice(9).reduce((total, { count }) => total + count, 0);
        return {
            chart: [...topResidues, ...(unshownResidueCount > 0 ? [{ name: 'Other', count: unshownResidueCount }] : [])],
            allCounts: sortedResidues.map(({ name, count }) => ({ name, count, percent: count / result.sequenceLength * 100 })),
            hydrophobicPercent: result.hydrophobicResidues / result.sequenceLength * 100,
            chargedPercent: result.chargedResidues / result.sequenceLength * 100,
            uniqueResidues: Object.values(counts).filter((count) => count > 0).length
        };
    }, [result, analyzedSequence]);

    const handleLoadSample = async () => {
        try {
            setError('');
            setLoading(true);
            const sample = await getSampleProtein();
            setSequence(sample.sequence);
            setResult(null);
            setAnalyzedSequence('');
        } catch {
            setError('Unable to load the sample sequence. You can still paste a sequence manually.');
        } finally {
            setLoading(false);
        }
    };

    const handlePredict = async () => {
        const normalized = normalizeSequence(sequence);
        if (normalized.error) {
            setError(normalized.error);
            setResult(null);
            setAnalyzedSequence('');
            return;
        }
        try {
            setError('');
            setLoading(true);
            const prediction = await predictProtein(normalized.sequence);
            setResult(prediction);
            setAnalyzedSequence(normalized.sequence);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Unable to analyze this sequence.');
            setResult(null);
            setAnalyzedSequence('');
        } finally {
            setLoading(false);
        }
    };

    const updateSequence = (value) => {
        setSequence(value);
        setResult(null);
        setAnalyzedSequence('');
        setError('');
    };

    const inputCheck = normalizeSequence(sequence);
    const inputSymbolCount = inputCheck.sequence?.length ?? sequence.split(/\r?\n/).filter((line) => !line.trim().startsWith('>')).join('').replace(/\s/g, '').length;

    return <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4"><div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Dna size={24}/></div><div><h2 className="text-xl font-bold text-slate-800">Protein Sequence Analysis</h2><p className="text-sm text-slate-500">Composition profile and transparent prototype heuristic</p></div></div>

        <section className="mb-5" aria-label="Protein analysis workflow"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Analysis workflow</p><span className="text-[10px] text-slate-400">{result ? 'Completed' : sequence.trim() ? 'Input supplied' : 'Ready for input'}</span></div><ol className="grid grid-cols-2 gap-2 lg:grid-cols-4">{workflow.map(([number, title, detail], index) => { const complete = result || (sequence.trim() && index === 0); return <li key={number} className={`rounded-md border p-2.5 ${complete ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}><div className="flex items-center gap-1.5"><span className={`text-[10px] font-bold ${complete ? 'text-indigo-700' : 'text-slate-400'}`}>{number}</span>{complete && <Check size={12} className="text-indigo-600"/>}</div><p className="mt-1 text-xs font-semibold text-slate-800">{title}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">{detail}</p></li>; })}</ol></section>

        <div className="mb-3 flex items-start justify-between gap-3"><div><label htmlFor="protein-sequence" className="block text-sm font-semibold text-slate-700">Amino-acid sequence</label><p className="mt-1 text-xs leading-5 text-slate-500">Accepted: 20 standard one-letter codes (ACDEFGHIKLMNPQRSTVWY). Whitespace and FASTA header lines are ignored.</p></div><span className={`shrink-0 rounded px-2 py-1 font-mono text-[10px] ${inputCheck.sequence ? 'bg-emerald-50 text-emerald-700' : sequence.trim() ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{inputSymbolCount} {inputCheck.sequence ? 'residues · valid' : sequence.trim() ? 'symbols · check input' : 'residues'}</span></div>
        <textarea id="protein-sequence" value={sequence} onChange={(e) => updateSequence(e.target.value)} className="w-full min-h-28 rounded-lg border border-slate-300 p-3 font-mono text-sm uppercase leading-6 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder={'>sample_protein\nMKTIIALSYIFCLVFADYKDDDDK'} spellCheck="false" aria-describedby="protein-input-help" />
        <p id="protein-input-help" className="mt-1 text-[10px] text-slate-400">For FASTA input, lines starting with “&gt;” are treated as headers and skipped.</p>

        {error && <div role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={16} className="mt-0.5 shrink-0"/><span>{error}</span></div>}
        <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={handleLoadSample} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"><Download size={15}/> Load example</button><button type="button" onClick={handlePredict} disabled={loading || !sequence.trim()} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"><Search size={15}/>{loading ? <><LoaderCircle size={15} className="animate-spin"/> Analyzing…</> : 'Analyze sequence'}</button></div>

        {result && sequenceProfile && <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Analysis complete</p><h3 className="mt-1 text-lg font-bold text-slate-900">Sequence profile</h3></div><span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-900">Prototype heuristic · not validated structure</span></div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="Sequence length" value={`${result.sequenceLength} aa`} detail="residues"/><Metric label="Unique residues" value={`${sequenceProfile.uniqueResidues} / 20`} detail="types present"/><Metric label="Hydrophobic set" value={`${result.hydrophobicResidues} · ${sequenceProfile.hydrophobicPercent.toFixed(1)}%`} detail="AVILMFYW"/><Metric label="Charged set" value={`${result.chargedResidues} · ${sequenceProfile.chargedPercent.toFixed(1)}%`} detail="RHKDE"/></div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
                <div className="rounded-md border border-slate-200 bg-white p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Residue composition</p><p className="mt-1 text-xs text-slate-600">Most frequent residue types in the sequence</p></div><span className="text-[10px] text-slate-400">count</span></div><div className="mt-2 h-52 w-full" role="img" aria-label="Bar chart of the most frequent amino acid residue types"><ResponsiveContainer width="100%" height="100%"><BarChart data={sequenceProfile.chart} margin={{ top: 4, right: 8, left: -22, bottom: 2 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/><XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false}/><Tooltip formatter={(value) => [`${value} residue${value === 1 ? '' : 's'}`, 'Count']}/><Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={26}/></BarChart></ResponsiveContainer></div><p className="text-[10px] leading-4 text-slate-500">Shows the top nine residue types; “Other” groups remaining types when present.</p></div>
                <div className="space-y-3"><div className="rounded-md border border-slate-200 bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Approximate molecular mass</p><p className="mt-1 text-xl font-bold text-slate-900">{Number(result.molecularWeight).toLocaleString()} Da</p><p className="mt-1 text-[10px] leading-4 text-slate-500">Prototype estimate of about 110 Da per residue. It is not an exact sequence-specific mass.</p></div><div className="rounded-md border border-indigo-200 bg-indigo-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Rule-based sequence label</p><p className="mt-1 text-base font-bold text-indigo-950">{result.prediction}</p><p className="mt-2 text-xs leading-5 text-indigo-950">{getLabelExplanation(result)}</p></div></div>
            </div>

            <details className="mt-3 rounded-md border border-slate-200 bg-white p-3"><summary className="cursor-pointer text-xs font-semibold text-slate-700">View all residue counts and percentages</summary><div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-5">{sequenceProfile.allCounts.map(({ name, count, percent }) => <div key={name} className="flex items-center justify-between rounded bg-slate-50 px-2 py-1.5 text-xs"><span className="font-mono font-bold text-indigo-700">{name}</span><span className="text-slate-700">{count} <span className="text-slate-400">({percent.toFixed(1)}%)</span></span></div>)}</div></details>

            <div className="mt-3 rounded-md border border-slate-200 bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">How to interpret this result</p><ol className="mt-2 grid gap-2 sm:grid-cols-3"><li className="flex gap-2 text-xs leading-5 text-slate-700"><span className="font-bold text-indigo-600">1.</span><span>Counts and percentages describe the input sequence using the displayed residue sets.</span></li><li className="flex gap-2 text-xs leading-5 text-slate-700"><span className="font-bold text-indigo-600">2.</span><span>The label follows simple composition thresholds in the prototype code; it is not a confidence score.</span></li><li className="flex gap-2 text-xs leading-5 text-slate-700"><span className="font-bold text-indigo-600">3.</span><span>No atomic coordinates, validated fold, pI, or hydropathy calculation is produced by this version.</span></li></ol></div>
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-950"><b>Scope:</b> This tool validates and summarizes a protein sequence with a simple prototype heuristic. It does not perform experimentally validated or AI-based 3D protein structure prediction. Do not treat the heuristic label as a structural result.</p>
        </section>}

        {!sequence && !result && <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-7 text-slate-400"><Dna size={28} className="opacity-40"/><p className="text-xs">Paste a sequence or load the example to begin.</p></div>}
    </div>;
}

function Metric({ label, value, detail }) {
    return <div className="rounded-md border border-slate-200 bg-white p-3"><p className="text-[10px] font-semibold text-slate-500">{label}</p><p className="mt-1 text-sm font-bold text-slate-900">{value}</p><p className="mt-1 font-mono text-[9px] text-slate-400">{detail}</p></div>;
}
