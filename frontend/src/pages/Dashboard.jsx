import React, { useState } from 'react';
import DatasetLibrary from '../components/DatasetLibrary';
import ECGAnalysis from '../components/ECGAnalysis';
import ProteinPrediction from '../components/ProteinPrediction';
import RespiratoryAnalysis from '../components/RespiratoryAnalysis';
import { Activity, ArrowUpRight, Check, ChevronRight, CircleDot, Dna, HeartPulse, Layers3, Microscope, ShieldCheck, Sparkles, Waves, Wind } from 'lucide-react';

const modules = {
  ecg: {
    number: '01', title: 'Healthcare intelligence', subtitle: 'ECG signal analysis', icon: HeartPulse, theme: 'coral',
    description: 'Turn cardiac waveform data into a clear, review-ready view of signal quality and rhythm indicators.',
    features: [
      ['Waveform ingestion', 'Load a CSV trace, map its sample values, and inspect the signal before analysis. Supports a guided demo trace when you want to explore the interface first.'],
      ['Signal display', 'View a plotted trace from the uploaded CSV. The current analysis endpoint returns fixed demonstration values rather than computing clinical measurements from the waveform.'],
      ['Demonstration metrics', 'See illustrative heart-rate and amplitude fields alongside the trace. These placeholder values are not measurements derived from your upload.'],
      ['Visual signal review', 'Use the plotted waveform to spot broad changes, gaps, and unusual sections that merit closer human review. The visualization complements the numerical summary.'],
      ['Result review', 'Bring input status, measurements, and signal visualization together in a compact analysis view that can support documentation and discussion.'],
      ['Emergency symptom check', 'Enter current symptoms to check for selected emergency warning phrases. This limited text check cannot rule out an emergency.'],
      ['Medication scope', 'Review a clear explanation of why the prototype does not select medicines and where to ask about medication safely.']
    ],
    technologies: [
      ['React', 'Builds the interactive analysis interface and manages the selected data and results.'],
      ['Recharts', 'Renders the ECG waveform and supporting data visualizations.'],
      ['Spring Boot demo endpoint', 'Currently returns fixed placeholder results; it is not a clinical ECG interpretation service.'],
      ['CSV input', 'Carries tabular waveform samples into the analysis workflow.']
    ],
    outputs: ['Waveform visualization', 'Fixed demo heart-rate field', 'Fixed demo amplitude field', 'Entered symptom warning check'],
    workflow: [['Import', 'Choose a demo trace or upload waveform data.'], ['Validate', 'Check the input structure and sample availability.'], ['Analyze', 'Calculate the configured signal measurements.'], ['Review', 'Inspect the plot and result summary together.']],
    scope: 'The ECG backend currently returns fixed placeholder values and does not interpret the uploaded trace. The symptom screen is a limited text check, not triage. This workspace cannot diagnose, determine that home care is safe, or prescribe medication.'
  },
  protein: {
    number: '02', title: 'Molecular discovery', subtitle: 'Protein structure analysis', icon: Microscope, theme: 'violet',
    description: 'Validate a protein sequence, inspect its residue composition, and understand exactly how the prototype assigns its rule-based label.',
    features: [
      ['Sequence validation', 'Accept the 20 standard one-letter amino-acid codes. Whitespace and FASTA header lines are removed; invalid symbols are reported with their position.'],
      ['Residue composition', 'See per-residue counts, the number of unique residue types, and a chart of the most frequent residues.'],
      ['Hydrophobic fraction', 'Count the prototype’s hydrophobic set (AVILMFYW) and report its proportion of the input sequence.'],
      ['Charged fraction', 'Count the prototype’s charged set (RHKDE) and report its proportion of the input sequence.'],
      ['Approximate molecular mass', 'Estimate mass using the prototype’s rough 110 Da per residue rule; this is not an exact sequence-specific calculation.'],
      ['Heuristic sequence label', 'Show which simple composition threshold selected the label and why it is not a validated secondary or 3D structure prediction.']
    ],
    technologies: [
      ['React', 'Powers FASTA/sequence entry, the four-stage workflow, and result presentation.'],
      ['Spring Boot + Java', 'Validates symbols and applies fixed composition thresholds in the protein endpoint.'],
      ['Recharts', 'Visualizes the frequency of amino-acid residue types in the supplied sequence.'],
      ['Rule-based prototype', 'Assigns a label from hydrophobic and charged counts; it is not a trained folding model.']
    ],
    outputs: ['Sequence length and residue counts', 'Hydrophobic / charged percentages', 'Approximate mass estimate', 'Heuristic label with rule explanation'],
    workflow: [['Enter sequence', 'Paste a sequence or FASTA text, or load the example.'], ['Validate', 'Normalize whitespace and headers; check each residue code.'], ['Build profile', 'Count residue types and calculate composition fractions.'], ['Interpret', 'Review the threshold label and the limits of this prototype.']],
    scope: 'This version does not calculate pI or hydropathy, generate atomic coordinates, or perform validated/AI-based 3D structure prediction. Its secondary-structure-like label is a simple composition heuristic, not a biological prediction.'
  },
  respiratory: {
    number: '03', title: 'Respiratory symptom review', subtitle: 'Respiratory health analysis', icon: Wind, theme: 'blue',
    description: 'Organize a known respiratory condition, reported symptoms, side effects, and timing into a clear review summary.',
    features: [
      ['Condition and concern', 'Enter a known diagnosis or an undiagnosed concern. The tool records the wording you provide and never verifies or infers a disease.'],
      ['Symptoms and side effects', 'Add observations in your own words, or use the one-click sample review to populate the form and view a ready-made example. Items remain visible in results.'],
      ['Symptom groupings', 'A transparent keyword map groups recognizable phrases into breathing, cough and mucus, upper airway, or general symptom categories.'],
      ['Time course and severity', 'Record how long symptoms have been present and your own severity description to prepare for a conversation with a clinician.'],
      ['Emergency phrase check', 'A limited phrase check highlights selected respiratory emergency warning signs and displays an urgent care message.'],
      ['Review summary', 'See the submitted concern, reported observations, detected groupings, and important limitations together.']
    ],
    technologies: [
      ['React', 'Powers the interactive form and renders the generated summary.'],
      ['Recharts', 'Displays an item-count graph across the detected symptom groupings.'],
      ['Local rule set', 'Uses explicit phrase matching for symptom groups and selected emergency warning signs.'],
      ['Client-side processing', 'Keeps this prototype summary in the browser; no respiratory analysis API is currently connected.'],
      ['Accessible form controls', 'Provides labeled fields, keyboard access, and announced analysis results.']
    ],
    outputs: ['Condition as entered', 'Reported symptom list', 'Symptom group graph', 'Urgency phrase flag'],
    workflow: [['Describe', 'Load the sample or enter a condition.'], ['Record', 'List symptoms or possible side effects.'], ['Context', 'Add duration and a self-reported severity.'], ['Review', 'Read the graph, details, and safety message.']],
    scope: 'This educational organizer is not a diagnostic tool, a medical triage service, or a substitute for professional advice. Its phrase check is limited and cannot rule out an emergency.'
  }
};

function ModuleCard({ id, data }) {
  const [feature, setFeature] = useState(null);
  const Icon = data.icon;
  return (
    <article className={`module-card module-card--${data.theme}`} tabIndex={0} aria-label={`${data.title} capability and interactive analysis`} onMouseLeave={(event) => { const focused = document.activeElement; if (focused && event.currentTarget.contains(focused)) focused.blur(); }}>
      <div className="module-card__glow" aria-hidden="true" />
      <div className="module-card__topline"><span className="module-card__number">CAPABILITY / {data.number}</span><span className="module-card__icon"><Icon size={21} strokeWidth={1.8} /></span></div>
      <div className="module-card__intro">
        <p className="module-card__eyebrow">{data.subtitle}</p>
        <h3>{data.title}</h3>
        <p className="module-card__description">{data.description}</p>
      </div>
      <div className="module-card__details">
        <div className="detail-heading"><span>Explore capabilities</span><span className="detail-hint">Select a feature</span></div>
        <div className="feature-list">
          {data.features.map(([name], index) => <button className={`feature-chip ${feature === index ? 'is-selected' : ''}`} key={name} onClick={() => setFeature(feature === index ? null : index)} aria-expanded={feature === index}><span className="feature-chip__dot">{feature === index ? <Check size={12} /> : <CircleDot size={12} />}</span>{name}<ChevronRight size={14} className="feature-chip__arrow" /></button>)}
        </div>
        <div className="feature-reveal" aria-live="polite">{feature !== null ? <><span className="feature-reveal__label">FEATURE DETAIL · {data.features[feature][0]}</span><p>{data.features[feature][1]}</p></> : <><span className="feature-reveal__label">TECHNOLOGY STACK</span><div className="technology-list">{data.technologies.map(([name, role]) => <div className="technology-row" key={name}><b>{name}</b><span>{role}</span></div>)}</div></>}</div>
        <div className="workflow"><span className="workflow__label">WORKFLOW</span><div className="workflow__steps">{data.workflow.map(([step], index) => <React.Fragment key={step}><span>{step}</span>{index < data.workflow.length - 1 && <i />}</React.Fragment>)}</div><div className="workflow-detail-grid">{data.workflow.map(([step, detail], index) => <div key={step}><b>0{index + 1} / {step}</b><p>{detail}</p></div>)}</div></div>
        <div className="outputs-block"><span className="workflow__label">ANALYSIS OUTPUTS</span><div className="output-chips">{data.outputs.map((output) => <span key={output}>{output}</span>)}</div></div>
        <div className="scope-note"><b>INTERPRETATION & SCOPE</b><p>{data.scope}</p></div>
      </div>
      <div className="card-workspace"><div className="card-workspace__heading"><span>INTERACTIVE WORKSPACE</span><span>Move pointer away to close</span></div><div className="workspace-content">{id === 'ecg' ? <ECGAnalysis /> : id === 'protein' ? <ProteinPrediction /> : <RespiratoryAnalysis />}</div></div>
      <span className="module-card__index">0{data.number}</span>
    </article>
  );
}

export default function Dashboard() {
  return <div className="biomed-app">
    <header className="site-header"><a className="brand" href="#top" aria-label="Cloud BioMed home"><span className="brand__mark"><Activity size={19} /></span><span><b>Cloud BioMed</b><small>COMPUTATIONAL HEALTH SCIENCES</small></span></a><div className="header-status"><span className="status-dot" />Platform operational <span className="header-divider" /> Research workspace <Layers3 size={15} /></div><a className="header-link" href="#modules">Explore platform <ArrowUpRight size={15} /></a></header>
    <main id="top">
      <section className="hero-shell">
        <div className="hero-copy"><div className="hero-kicker"><Sparkles size={14} /> INSIGHT AT THE INTERSECTION OF BIOLOGY & DATA</div><h1>Make complex biology<br /><span>easier to explore.</span></h1><p>A focused workspace for biomedical signals, respiratory symptoms, and molecular structure. Understand the capabilities, follow the workflow, and move into analysis when you’re ready.</p><a className="hero-cta" href="#modules">Explore capabilities <ChevronRight size={17} /></a><div className="hero-meta"><span><ShieldCheck size={15} /> Transparent workflows</span><span><Waves size={15} /> Interactive analysis</span></div></div>
        <div className="hero-visual" aria-label="Abstract molecular visualization"><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-orbit orbit-three"/><div className="visual-core"><Dna size={62} strokeWidth={1.15}/></div><span className="visual-node node-one"/><span className="visual-node node-two"/><span className="visual-node node-three"/><span className="visual-caption">BIOLOGY, IN A NEW DIMENSION</span><span className="visual-coordinate">42° 21′ 08″ N<br/>71° 05′ 22″ W</span></div>
        <div className="hero-index"><span>01 — 03</span><span>CAPABILITIES</span></div>
      </section>
      <section className="capabilities-section" id="modules"><div className="section-heading"><div><p className="section-kicker">THE PLATFORM</p><h2>Three ways to investigate.</h2></div><p className="section-note">Hover a capability to explore its scope.<br/>Choose any feature to see what it does.</p></div>
        <div className="module-grid">{Object.entries(modules).map(([id, data]) => <ModuleCard key={id} id={id} data={data} />)}</div>
      </section>
      <DatasetLibrary />
      <section className="platform-note"><span className="platform-note__icon"><Activity size={18}/></span><div><b>Built for thoughtful analysis.</b><p>Clear workflows, visible methods, and focused tools for biomedical exploration.</p></div><span className="platform-note__tag">CLOUD BIOMED · 2025</span></section>
    </main><footer className="site-footer"><span>© Cloud BioMed</span><span>Biomedical analysis workspace</span><span className="footer-status"><span className="status-dot"/> All systems local</span></footer>
  </div>;
}
