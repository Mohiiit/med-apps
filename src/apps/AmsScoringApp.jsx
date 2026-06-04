import { useState, useEffect } from "react";

// ─── AMS Scoring Data (Lake Louise Score 2018 revised) ────────────────────────

const LLS_SYMPTOMS = [
  {
    id: "headache",
    label: "Headache",
    required: true,
    tag: "REQUIRED",
    options: [
      { score: 0, text: "No headache" },
      { score: 1, text: "Mild headache" },
      { score: 2, text: "Moderate headache" },
      { score: 3, text: "Severe, incapacitating headache" },
    ],
  },
  {
    id: "gi",
    label: "Gastrointestinal Symptoms",
    options: [
      { score: 0, text: "No GI symptoms" },
      { score: 1, text: "Poor appetite or nausea" },
      { score: 2, text: "Moderate nausea or vomiting" },
      { score: 3, text: "Severe nausea / vomiting, incapacitating" },
    ],
  },
  {
    id: "fatigue",
    label: "Fatigue / Weakness",
    options: [
      { score: 0, text: "Not tired or weak" },
      { score: 1, text: "Mild fatigue / weakness" },
      { score: 2, text: "Moderate fatigue / weakness" },
      { score: 3, text: "Severe fatigue / weakness, incapacitating" },
    ],
  },
  {
    id: "dizzy",
    label: "Dizziness / Light-headedness",
    options: [
      { score: 0, text: "Not dizzy" },
      { score: 1, text: "Mild dizziness" },
      { score: 2, text: "Moderate dizziness" },
      { score: 3, text: "Severe, incapacitating dizziness" },
    ],
  },
];

const HACE_SIGNS = [
  {
    id: "ataxia",
    label: "Ataxia (Tandem Gait Test)",
    options: [
      { score: 0, text: "No ataxia" },
      { score: 1, text: "Balance manoeuvres used" },
      { score: 2, text: "Steps off line" },
      { score: 3, text: "Falls down" },
      { score: 4, text: "Cannot stand / walk" },
    ],
  },
  {
    id: "ms",
    label: "Mental Status / Altered Consciousness",
    options: [
      { score: 0, text: "Alert & oriented" },
      { score: 1, text: "Confusion / disoriented" },
      { score: 2, text: "Lethargic / reduced activity" },
      { score: 3, text: "Stuporous / difficult to arouse" },
      { score: 4, text: "Semicomatose / comatose" },
    ],
  },
];

const HACE_FEATURES = [
  "Headache not responding to analgesia",
  "Ataxia present",
  "Altered level of consciousness",
  "Papilloedema",
  "Focal neurological deficit",
  "Seizures",
];

const HACE_CRITERIA_NOTE =
  "HACE is diagnosed when AMS is present AND EITHER ataxia OR altered consciousness exists (or both).";

// ─── Interpretation ───────────────────────────────────────────────────────────

function interpretLLS(score, hasHeadache) {
  if (!hasHeadache) return { level: "invalid", label: "Headache required", color: "#64748b", bg: "#1e293b", desc: "Headache must be present (score ≥ 1) for AMS diagnosis by LLS." };
  if (score <= 0) return { level: "none", label: "No AMS", color: "#4ade80", bg: "#052e16", desc: "No acute mountain sickness. Monitor symptoms with further ascent." };
  if (score <= 4) return { level: "mild", label: "Mild AMS", color: "#facc15", bg: "#1c1400", desc: "Mild AMS. Rest at current altitude. No further ascent until symptoms resolve. Consider ibuprofen / paracetamol for headache." };
  if (score <= 8) return { level: "moderate", label: "Moderate AMS", color: "#fb923c", bg: "#1c0a00", desc: "Moderate AMS. Halt ascent. Descend if no improvement in 24h. Consider acetazolamide 250mg BD. Supplemental O₂ if available." };
  return { level: "severe", label: "Severe AMS", color: "#f87171", bg: "#1c0000", desc: "Severe AMS. Immediate descent of ≥300–500m. Supplemental O₂. Dexamethasone 8mg loading dose. Consider portable hyperbaric chamber (Gamow bag)." };
}

function interpretHACE(ataxiaScore, msScore, features) {
  const confirmed = (ataxiaScore >= 1 || msScore >= 1) && features.length >= 1;
  const suspected = ataxiaScore >= 1 || msScore >= 1;
  if (msScore >= 3 || ataxiaScore >= 3) return { level: "critical", label: "HACE — CRITICAL", color: "#ef4444", bg: "#1a0000", desc: "Immediate life-saving intervention. Descend NOW. Dexamethasone 8mg IM/IV + supplemental O₂. Portable hyperbaric chamber. Evacuate urgently." };
  if (suspected) return { level: "hace", label: "HACE — Likely", color: "#dc2626", bg: "#1a0000", desc: "High altitude cerebral oedema likely. Immediate descent ≥1000m. Dexamethasone 8mg stat. Supplemental O₂. Do NOT allow to sleep at altitude." };
  return { level: "none", label: "HACE — Not indicated", color: "#4ade80", bg: "#052e16", desc: "No current signs of HACE. Reassess with any neurological change." };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const css = `

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  .q-opt:active, .feature-item:active, .reset-btn:active { transform: scale(0.99); }

  :host {
    display: block;
    background: #080c10;
    color: #e2e8f0;
    font-family: 'IBM Plex Sans', sans-serif;
    min-height: 100%;
  }

  .wrap { max-width: 760px; margin: 0 auto; padding: 36px 18px 100px; }

  /* Header */
  .hdr {
    margin-bottom: 44px;
  }
  .hdr-strip {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }
  .hdr-icon {
    font-size: 28px;
    line-height: 1;
  }
  .hdr-tag {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #f97316;
    border: 1px solid #7c2d12;
    padding: 3px 10px;
    border-radius: 4px;
    background: #1c0e00;
  }
  .hdr h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(38px, 9vw, 72px);
    letter-spacing: 0.04em;
    line-height: 0.9;
    color: #fff;
  }
  .hdr h1 em {
    color: #f97316;
    font-style: normal;
  }
  .hdr-sub {
    font-size: 13px;
    color: #64748b;
    margin-top: 10px;
    font-weight: 300;
    letter-spacing: 0.02em;
  }
  .hdr-rule { border: none; border-top: 1px solid #1e2d3d; margin-top: 22px; }

  /* Altitude input */
  .alt-row {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }
  .alt-field { flex: 1; min-width: 160px; }
  .alt-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: #64748b;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .alt-input {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 18px;
    font-weight: 600;
    background: #0d1520;
    border: 1px solid #1e2d3d;
    border-radius: 8px;
    color: #f97316;
    padding: 10px 14px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s;
  }
  .alt-input:focus { border-color: #f97316; }
  .alt-input::placeholder { color: #334155; }

  /* Score display */
  .score-banner {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px 24px;
    border-radius: 12px;
    border: 1px solid;
    margin-bottom: 32px;
    transition: all 0.3s;
    flex-wrap: wrap;
  }
  .score-number {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 64px;
    line-height: 1;
    flex-shrink: 0;
  }
  .score-info { flex: 1; }
  .score-label {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 0.06em;
    margin-bottom: 4px;
  }
  .score-desc {
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.55;
    font-weight: 300;
  }

  /* Section */
  .section {
    margin-bottom: 28px;
  }
  .sec-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
  .sec-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #94a3b8;
    font-weight: 600;
  }
  .sec-line { flex: 1; height: 1px; background: #1e2d3d; }
  .sec-req {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: #f97316;
    letter-spacing: 0.15em;
    border: 1px solid #7c2d12;
    padding: 2px 7px;
    border-radius: 3px;
  }

  /* Question card */
  .q-card {
    background: #0d1520;
    border: 1px solid #1e2d3d;
    border-radius: 10px;
    margin-bottom: 10px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .q-card.answered { border-color: #1e3a5f; }

  .q-label {
    padding: 12px 16px 8px;
    font-size: 13px;
    font-weight: 600;
    color: #cbd5e1;
    border-bottom: 1px solid #1e2d3d;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .q-score-badge {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    color: #f97316;
    background: #1c0e00;
    border: 1px solid #7c2d12;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .q-options {
    display: flex;
    flex-direction: column;
  }
  .q-opt {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 16px;
    cursor: pointer;
    transition: background 0.12s;
    border-bottom: 1px solid #0f1c2b;
  }
  .q-opt:last-child { border-bottom: none; }
  .q-opt:hover { background: #111e2e; }
  .q-opt.selected { background: #0f2236; }

  .q-radio {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid #334155;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }
  .q-opt.selected .q-radio {
    border-color: #3b82f6;
    background: #3b82f6;
  }
  .q-radio-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .q-opt.selected .q-radio-dot { opacity: 1; }

  .q-score-chip {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    width: 20px;
    text-align: center;
    color: #475569;
    flex-shrink: 0;
  }
  .q-opt.selected .q-score-chip { color: #60a5fa; }
  .q-opt-text {
    font-size: 12px;
    color: #64748b;
    flex: 1;
    line-height: 1.4;
  }
  .q-opt.selected .q-opt-text { color: #e2e8f0; }

  /* HACE section */
  .hace-box {
    border-radius: 10px;
    border: 1px solid #3f0000;
    background: #0e0500;
    padding: 16px 18px;
    margin-bottom: 10px;
  }
  .hace-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    color: #dc2626;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .hace-note {
    font-size: 11px;
    color: #7f1d1d;
    line-height: 1.5;
    font-style: italic;
  }

  /* Features checklist */
  .feature-list { display: flex; flex-direction: column; gap: 6px; }
  .feature-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #1e2d3d;
    cursor: pointer;
    background: #0d1520;
    transition: all 0.12s;
    font-size: 12px;
    color: #64748b;
    user-select: none;
  }
  .feature-item:hover { border-color: #334155; color: #cbd5e1; }
  .feature-item.checked { border-color: #7f1d1d; background: #1a0505; color: #fca5a5; }
  .feature-check {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 2px solid #334155;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    transition: all 0.12s;
  }
  .feature-item.checked .feature-check { border-color: #dc2626; background: #dc2626; color: #fff; }

  /* HACE result banner */
  .hace-result {
    padding: 16px 20px;
    border-radius: 10px;
    border: 1px solid;
    margin-top: 12px;
  }
  .hace-result-lbl {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    letter-spacing: 0.06em;
    margin-bottom: 4px;
  }
  .hace-result-desc {
    font-size: 12px;
    line-height: 1.5;
    color: #94a3b8;
  }

  /* Management */
  .mgmt-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    margin-top: 12px;
  }
  .mgmt-card {
    background: #0d1520;
    border: 1px solid #1e2d3d;
    border-radius: 8px;
    padding: 14px;
  }
  .mgmt-head {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 8px;
  }
  .mgmt-items { display: flex; flex-direction: column; gap: 4px; }
  .mgmt-item {
    font-size: 12px;
    color: #94a3b8;
    padding-left: 10px;
    position: relative;
    line-height: 1.4;
  }
  .mgmt-item::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #334155;
    font-size: 10px;
  }

  /* Reset */
  .reset-btn {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    padding: 10px 22px;
    background: transparent;
    border: 1px solid #1e2d3d;
    color: #475569;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 32px;
    transition: all 0.15s;
    display: block;
    margin-left: auto;
  }
  .reset-btn:hover { border-color: #475569; color: #94a3b8; }

  @media (max-width: 600px) {
    .wrap { padding: 28px 16px 90px; }
    .score-number { font-size: 48px; }
    .score-banner { gap: 12px; padding: 16px; }

    /* >=16px form text stops iOS Safari from zooming on focus. The unit /
       ascent-rate dropdowns set font-size inline, so override with !important. */
    .alt-input { font-size: 16px; }
    .alt-row select { font-size: 16px !important; }

    /* Bigger tap targets for the scoring rows and HACE feature checklist. */
    .q-opt { padding: 14px 16px; }
    .feature-item { padding: 13px 12px; }
    .reset-btn { padding: 14px 22px; }
  }
`;

const MANAGEMENT = {
  none: {
    Monitoring: ["Observe symptoms closely", "No ascent for 24h if any symptoms", "Stay hydrated", "Avoid alcohol / sedatives"],
    Medications: ["None required", "OTC analgesia if mild headache"],
  },
  mild: {
    "Ascent": ["HALT — no further ascent", "Rest at current altitude", "Descend if no improvement in 24h"],
    "Medications": ["Ibuprofen 400mg TDS or paracetamol 1g QDS", "Acetazolamide 250mg BD (optional)", "Avoid alcohol, sedatives"],
    "Oxygen": ["Supplemental O₂ if available (1–2 L/min)"],
  },
  moderate: {
    "Ascent": ["HALT ascent immediately", "Descend 300–500m if no improvement"],
    "Medications": ["Acetazolamide 250mg BD", "Dexamethasone 4mg Q6h (if severe)", "Analgesia for headache"],
    "Oxygen": ["Supplemental O₂ 2–4 L/min", "Hyperbaric bag if available"],
  },
  severe: {
    "IMMEDIATE": ["Descend NOW ≥500–1000m", "Do not sleep at altitude", "Evacuate urgently"],
    "Medications": ["Dexamethasone 8mg loading, then 4mg Q6h", "Acetazolamide 250mg BD"],
    "Oxygen": ["High-flow O₂ 4–6 L/min", "Portable hyperbaric chamber (Gamow bag)"],
  },
  hace: {
    "EMERGENCY": ["Immediate descent ≥1000m", "Evacuate urgently — life-threatening"],
    "Medications": ["Dexamethasone 8mg IM/IV stat, then 4mg Q6h", "Do NOT give sedatives"],
    "Oxygen": ["High-flow O₂ 6–8 L/min", "Gamow bag while organising descent"],
    "Monitoring": ["Neuro obs Q15 min", "Alert rescue services"],
  },
  critical: {
    "CRITICAL — ACT NOW": ["Descend immediately regardless of time / weather", "Call emergency services / helicopter evacuation"],
    "Medications": ["Dexamethasone 8mg IM/IV STAT", "Acetazolamide 250mg if alert"],
    "Oxygen": ["Max-flow O₂", "Gamow bag immediately"],
  },
};

export default function App({ onDataChange }) {
  const [altitude, setAltitude] = useState("");
  const [scores, setScores] = useState({});
  const [haceFeatures, setHaceFeatures] = useState([]);

  const setScore = (id, val) => setScores(p => ({ ...p, [id]: val }));
  const toggleFeature = (f) => setHaceFeatures(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f]);

  // LLS total
  const llsTotal = LLS_SYMPTOMS.reduce((a, s) => a + (scores[s.id] ?? 0), 0);
  const hasHeadache = (scores["headache"] ?? 0) >= 1;
  const llsInterp = interpretLLS(llsTotal, hasHeadache);

  // HACE
  const ataxiaScore = scores["ataxia"] ?? 0;
  const msScore = scores["ms"] ?? 0;
  const haceInterp = interpretHACE(ataxiaScore, msScore, haceFeatures);

  // Overall worst level
  const worstLevel = ["critical","hace"].includes(haceInterp.level) ? haceInterp.level : llsInterp.level;
  const mgmt = MANAGEMENT[worstLevel] || MANAGEMENT["none"];

  const allAnswered = LLS_SYMPTOMS.every(s => scores[s.id] !== undefined) &&
    HACE_SIGNS.every(s => scores[s.id] !== undefined);

  // Report the assessment upward so the store can persist it on demand.
  // Only report once there is real input — otherwise send {} so the store's
  // Save button stays disabled (the derived score labels are always present).
  useEffect(() => {
    const hasInput =
      altitude !== "" || Object.keys(scores).length > 0 || haceFeatures.length > 0;
    onDataChange?.(
      hasInput
        ? {
            altitude,
            scores,
            haceFeatures,
            llsTotal,
            llsLabel: llsInterp.label,
            haceLabel: haceInterp.label,
          }
        : {}
    );
  }, [altitude, scores, haceFeatures, llsTotal, llsInterp.label, haceInterp.label, onDataChange]);

  return (
    <>
      <style>{css}</style>
      <div className="wrap">

        {/* Header */}
        <div className="hdr">
          <div className="hdr-strip">
            <span className="hdr-icon">⛰</span>
            <span className="hdr-tag">Altitude Medicine</span>
          </div>
          <h1>ACUTE <em>MOUNTAIN</em><br />SICKNESS</h1>
          <p className="hdr-sub">Lake Louise Score 2018 · HACE Assessment · Management Guide</p>
          <hr className="hdr-rule" />
        </div>

        {/* Altitude */}
        <div className="alt-row">
          <div className="alt-field">
            <div className="alt-label">Current Altitude</div>
            <input
              className="alt-input"
              type="number"
              placeholder="e.g. 4200"
              value={altitude}
              onChange={e => setAltitude(e.target.value)}
            />
          </div>
          <div className="alt-field">
            <div className="alt-label">Unit</div>
            <select style={{ background: "#0d1520", border: "1px solid #1e2d3d", borderRadius: 8, color: "#f97316", fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, padding: "10px 14px", width: "100%", outline: "none" }}>
              <option>metres (m)</option>
              <option>feet (ft)</option>
            </select>
          </div>
          <div className="alt-field">
            <div className="alt-label">Ascent Rate</div>
            <select style={{ background: "#0d1520", border: "1px solid #1e2d3d", borderRadius: 8, color: "#94a3b8", fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 13, padding: "10px 14px", width: "100%", outline: "none" }}>
              <option>Gradual (&lt;300m/day above 3000m)</option>
              <option>Moderate (300–500m/day)</option>
              <option>Rapid (&gt;500m/day)</option>
              <option>Very rapid (&gt;1000m/day)</option>
            </select>
          </div>
        </div>

        {/* Live score banner */}
        <div className="score-banner" style={{ borderColor: llsInterp.color + "55", background: llsInterp.bg }}>
          <div className="score-number" style={{ color: llsInterp.color }}>{llsTotal}</div>
          <div className="score-info">
            <div className="score-label" style={{ color: llsInterp.color }}>{llsInterp.label}</div>
            <div className="score-desc">{llsInterp.desc}</div>
          </div>
        </div>

        {/* LLS Symptoms */}
        <div className="section">
          <div className="sec-title-row">
            <span className="sec-title">Lake Louise Score — Symptoms</span>
            <span className="sec-line" />
          </div>

          {LLS_SYMPTOMS.map(sym => {
            const val = scores[sym.id];
            return (
              <div key={sym.id} className={`q-card${val !== undefined ? " answered" : ""}`}>
                <div className="q-label">
                  {sym.label}
                  {sym.required && <span style={{ fontSize: 10, color: "#f97316", fontFamily: "'IBM Plex Mono',monospace", letterSpacing: "0.12em" }}>★ REQUIRED</span>}
                  {val !== undefined && <span className="q-score-badge">{val}</span>}
                </div>
                <div className="q-options">
                  {sym.options.map(opt => (
                    <div
                      key={opt.score}
                      className={`q-opt${val === opt.score ? " selected" : ""}`}
                      onClick={() => setScore(sym.id, opt.score)}
                    >
                      <div className="q-radio"><div className="q-radio-dot" /></div>
                      <span className="q-score-chip">{opt.score}</span>
                      <span className="q-opt-text">{opt.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* HACE section */}
        <div className="section">
          <div className="sec-title-row">
            <span className="sec-title">HACE Assessment</span>
            <span className="sec-line" />
          </div>

          <div className="hace-box">
            <div className="hace-title">⚠ High Altitude Cerebral Oedema</div>
            <div className="hace-note">{HACE_CRITERIA_NOTE}</div>
          </div>

          {HACE_SIGNS.map(sym => {
            const val = scores[sym.id];
            return (
              <div key={sym.id} className={`q-card${val !== undefined ? " answered" : ""}`}>
                <div className="q-label">
                  {sym.label}
                  {val !== undefined && <span className="q-score-badge">{val}</span>}
                </div>
                <div className="q-options">
                  {sym.options.map(opt => (
                    <div
                      key={opt.score}
                      className={`q-opt${val === opt.score ? " selected" : ""}`}
                      onClick={() => setScore(sym.id, opt.score)}
                    >
                      <div className="q-radio"><div className="q-radio-dot" /></div>
                      <span className="q-score-chip">{opt.score}</span>
                      <span className="q-opt-text">{opt.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* HACE features */}
          <div style={{ marginTop: 12 }}>
            <div className="alt-label" style={{ marginBottom: 8 }}>Additional HACE Features Present</div>
            <div className="feature-list">
              {HACE_FEATURES.map(f => (
                <div
                  key={f}
                  className={`feature-item${haceFeatures.includes(f) ? " checked" : ""}`}
                  onClick={() => toggleFeature(f)}
                >
                  <div className="feature-check">{haceFeatures.includes(f) ? "✓" : ""}</div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* HACE result */}
          <div
            className="hace-result"
            style={{ borderColor: haceInterp.color + "44", background: haceInterp.bg }}
          >
            <div className="hace-result-lbl" style={{ color: haceInterp.color }}>{haceInterp.label}</div>
            <div className="hace-result-desc">{haceInterp.desc}</div>
          </div>
        </div>

        {/* Management */}
        <div className="section">
          <div className="sec-title-row">
            <span className="sec-title">Management Plan</span>
            <span className="sec-line" />
          </div>
          <div className="mgmt-grid">
            {Object.entries(mgmt).map(([head, items]) => (
              <div key={head} className="mgmt-card">
                <div className="mgmt-head">{head}</div>
                <div className="mgmt-items">
                  {items.map(i => <div key={i} className="mgmt-item">{i}</div>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score legend */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {[
            { label: "0 — No AMS", color: "#4ade80" },
            { label: "1–4 — Mild", color: "#facc15" },
            { label: "5–8 — Moderate", color: "#fb923c" },
            { label: "9–12 — Severe", color: "#f87171" },
          ].map(b => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b", fontFamily: "'IBM Plex Mono',monospace" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.color }} />
              {b.label}
            </div>
          ))}
        </div>

        <button className="reset-btn" onClick={() => { setScores({}); setHaceFeatures([]); setAltitude(""); }}>
          RESET ASSESSMENT
        </button>

      </div>
    </>
  );
}
