import React, { useMemo, useState } from 'react';
import { AlertTriangle, ClipboardList, Download, Wind } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const RED_FLAGS = [
  { terms: ['difficulty breathing', 'trouble breathing', 'cannot breathe', 'can’t breathe', 'shortness of breath'], label: 'Severe or difficult breathing' },
  { terms: ['blue lips', 'bluish lips', 'blue face', 'grey lips', 'gray lips', 'pale blue'], label: 'Blue or grey lips / face' },
  { terms: ['confusion', 'hard to wake', 'cannot wake', 'unable to wake', 'unresponsive'], label: 'New confusion or difficulty waking' },
  { terms: ['chest pressure', 'chest pain', 'severe chest pain'], label: 'Chest pain or pressure' },
  { terms: ['coughing blood', 'cough up blood', 'blood in sputum'], label: 'Coughing up blood' }
];

const CATEGORIES = [
  { name: 'Breathing', terms: ['breath', 'shortness', 'wheeze', 'tight chest', 'panting'] },
  { name: 'Cough & mucus', terms: ['cough', 'phlegm', 'mucus', 'sputum'] },
  { name: 'Upper airway', terms: ['sore throat', 'throat', 'congestion', 'blocked nose', 'runny nose', 'sneeze', 'sinus'] },
  { name: 'General symptoms', terms: ['fever', 'chills', 'fatigue', 'tired', 'ache', 'weakness', 'headache'] }
];

function splitReportedItems(text) {
  return [...new Set(text.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean))];
}

export default function RespiratoryAnalysis() {
  const [condition, setCondition] = useState('');
  const [reported, setReported] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [result, setResult] = useState(null);

  const summary = useMemo(() => {
    if (!result) return null;
    const normalized = result.reported.toLowerCase();
    const categoryCounts = CATEGORIES.map((category) => ({
      name: category.name,
      count: splitReportedItems(result.reported).filter((item) => category.terms.some((term) => item.toLowerCase().includes(term))).length
    }));
    const categories = categoryCounts.filter(({ count }) => count > 0).map(({ name }) => name);
    const flags = RED_FLAGS.filter((flag) => flag.terms.some((term) => normalized.includes(term))).map(({ label }) => label);
    return { categories, categoryCounts, flags, items: splitReportedItems(result.reported) };
  }, [result]);

  const loadSample = () => {
    const sample = {
      condition: 'Acute bronchitis (sample scenario)',
      reported: 'cough, mucus, sore throat, fatigue',
      duration: '3 days',
      severity: 'Mild'
    };
    setCondition(sample.condition);
    setReported(sample.reported);
    setDuration(sample.duration);
    setSeverity(sample.severity);
    setResult(sample);
  };

  const analyze = (event) => {
    event.preventDefault();
    if (!condition.trim() || !reported.trim()) return;
    setResult({ condition: condition.trim(), reported: reported.trim(), duration: duration.trim(), severity });
  };

  return <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 flex flex-col">
    <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4"><div className="p-3 bg-sky-100 text-sky-700 rounded-lg"><Wind size={23}/></div><div><h2 className="text-xl font-bold text-slate-800">Respiratory Symptom Review</h2><p className="text-sm text-slate-500">Structured, rule-based summary · Educational use</p></div></div>
    <form onSubmit={analyze} className="space-y-4">
      <div><label htmlFor="resp-condition" className="block text-sm font-semibold text-slate-700 mb-1.5">Known condition or concern</label><input id="resp-condition" value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="e.g. asthma, bronchitis, or not yet diagnosed" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100" required/><p className="mt-1 text-xs text-slate-500">This is recorded as entered; the tool does not verify or diagnose a disease.</p></div>
      <div><label htmlFor="resp-reported" className="block text-sm font-semibold text-slate-700 mb-1.5">Symptoms, side effects, or observations</label><textarea id="resp-reported" value={reported} onChange={(e) => setReported(e.target.value)} placeholder="Enter each observation separated by a comma or new line. For example: cough, wheezing, fatigue" className="w-full min-h-24 rounded-lg border border-slate-300 px-3 py-2.5 text-sm leading-6 text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100" required/><p className="mt-1 text-xs text-slate-500">Include medication effects only if relevant, and identify them as such.</p></div>
      <div className="grid gap-3 sm:grid-cols-2"><div><label htmlFor="resp-duration" className="block text-sm font-semibold text-slate-700 mb-1.5">How long?</label><input id="resp-duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. since yesterday" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"/></div><div><label htmlFor="resp-severity" className="block text-sm font-semibold text-slate-700 mb-1.5">Your sense of severity</label><select id="resp-severity" value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"><option value="">Choose if helpful</option><option>Mild</option><option>Moderate</option><option>Severe</option><option>Worsening</option></select></div></div>
      <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={loadSample} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"><Download size={16}/> Load sample review</button><button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"><ClipboardList size={16}/> Generate symptom summary</button></div>
    </form>
    {result && summary && <section aria-live="polite" className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-slate-800">Respiratory review summary</h3><span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-800">Rule-based · not a diagnosis</span></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-md border border-slate-200 bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Condition / concern entered</p><p className="mt-1 text-sm font-semibold text-slate-800">{result.condition}</p></div><div className="rounded-md border border-slate-200 bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reported observations</p><p className="mt-1 text-sm font-semibold text-slate-800">{summary.items.length} item{summary.items.length === 1 ? '' : 's'} recorded</p><p className="mt-1 text-xs leading-5 text-slate-600">{summary.items.join(' · ')}</p></div></div>
      <div className="mt-3 rounded-md border border-slate-200 bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Symptom groupings detected</p>{summary.categories.length ? <div className="mt-2 flex flex-wrap gap-1.5">{summary.categories.map((category) => <span key={category} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{category}</span>)}</div> : <p className="mt-1 text-xs text-slate-600">No matching respiratory grouping found. Review the entered wording; unrecognized observations are retained above.</p>}</div>
      <div className="mt-3 rounded-md border border-slate-200 bg-white p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Symptom grouping graph</p><p className="mt-1 text-xs text-slate-600">Reported items matched to each keyword group</p></div><span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{summary.items.length} reported</span></div><div className="mt-3 h-44 w-full" role="img" aria-label="Bar chart showing reported symptom counts by respiratory category"><ResponsiveContainer width="100%" height="100%"><BarChart data={summary.categoryCounts} layout="vertical" margin={{ top: 2, right: 12, left: 3, bottom: 2 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0"/><XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false}/><YAxis type="category" dataKey="name" width={108} tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false}/><Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(value) => [`${value} item${value === 1 ? '' : 's'}`, 'Matched observations']}/><Bar dataKey="count" name="Matched observations" fill="#0284c7" radius={[0, 4, 4, 0]} maxBarSize={20}/></BarChart></ResponsiveContainer></div></div>
      <div className="mt-3 rounded-md border border-slate-200 bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Analysis details</p><div className="mt-2 grid gap-2 sm:grid-cols-3"><div className="rounded bg-slate-50 p-2.5"><p className="text-[10px] text-slate-500">Input recorded</p><p className="mt-1 text-xs font-semibold text-slate-800">{summary.items.length} observation{summary.items.length === 1 ? '' : 's'}</p></div><div className="rounded bg-slate-50 p-2.5"><p className="text-[10px] text-slate-500">Groups matched</p><p className="mt-1 text-xs font-semibold text-slate-800">{summary.categories.length} of {CATEGORIES.length} keyword groups</p></div><div className="rounded bg-slate-50 p-2.5"><p className="text-[10px] text-slate-500">Time course</p><p className="mt-1 text-xs font-semibold text-slate-800">{result.duration || 'Not provided'}{result.severity ? ` · ${result.severity}` : ''}</p></div></div><p className="mt-2 text-[11px] leading-5 text-slate-500">Each bar counts reported comma- or line-separated items that contain one or more matching keywords. An item can appear in more than one group. This graph does not measure disease severity or probability.</p></div>
      {(result.duration || result.severity) && <p className="mt-3 text-xs text-slate-600"><b>Reported course:</b> {[result.duration, result.severity].filter(Boolean).join(' · ')}</p>}
      {summary.flags.length ? <div role="alert" className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-950"><p className="flex items-center gap-2 text-sm font-bold"><AlertTriangle size={17}/> Emergency care may be needed now</p><ul className="mt-2 list-inside list-disc text-xs leading-5">{summary.flags.map((flag) => <li key={flag}>{flag}</li>)}</ul><p className="mt-2 text-xs leading-5">If these symptoms are happening now, seek emergency medical care immediately or call your local emergency number.</p></div> : <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950"><b>No listed warning phrase was detected.</b> This keyword check cannot determine whether hospital care is needed or whether it is safe to stay home. Seek urgent medical advice for severe, worsening, or concerning symptoms.</div>}
      <div className="mt-3 rounded-md border border-slate-200 bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Medication guidance</p><p className="mt-1 text-xs leading-5 text-slate-700">This tool cannot safely choose a medicine from a condition or symptom list. Use medication only as prescribed or as directed on its label; ask a clinician or pharmacist before starting or combining medicines.</p></div>
      <p className="mt-3 text-[11px] leading-5 text-slate-500">This summary organizes the information you entered; it does not infer a cause, assess interactions, or recommend treatment. <a className="font-semibold text-sky-800 underline" href="https://www.cdc.gov/respiratory-viruses/about/index.html" target="_blank" rel="noreferrer">CDC respiratory emergency warning signs</a> · <a className="font-semibold text-sky-800 underline" href="https://www.nhs.uk/conditions/bronchitis/" target="_blank" rel="noreferrer">NHS guidance on bronchitis warning signs</a>. Contact a qualified healthcare professional for medical advice.</p>
    </section>}
  </div>;
}
