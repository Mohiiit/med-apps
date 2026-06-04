import { useState, useEffect } from "react";

const sections = [
  {
    id: "demographics",
    title: "Patient Demographics",
    icon: "👤",
    fields: [
      { id: "name", label: "Patient Name", type: "text", placeholder: "Full name" },
      { id: "age", label: "Age", type: "number", placeholder: "Years" },
      { id: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
      { id: "occupation", label: "Occupation", type: "text", placeholder: "e.g., Teacher, Healthcare worker" },
    ],
  },
  {
    id: "chiefComplaint",
    title: "Chief Complaint",
    icon: "🔴",
    fields: [
      {
        id: "eye_involved",
        label: "Eye(s) Involved",
        type: "select",
        options: ["Right eye (OD)", "Left eye (OS)", "Both eyes (OU)"],
      },
      { id: "duration", label: "Duration of Symptoms", type: "text", placeholder: "e.g., 3 days" },
      { id: "onset", label: "Onset", type: "select", options: ["Sudden", "Gradual"] },
    ],
  },
  {
    id: "symptoms",
    title: "Symptom Profile",
    icon: "📋",
    fields: [
      {
        id: "discharge",
        label: "Discharge Type",
        type: "multiselect",
        options: ["Mucopurulent", "Purulent", "Watery", "Mucoid", "Stringy"],
      },
      {
        id: "discharge_timing",
        label: "Discharge Timing",
        type: "select",
        options: ["Continuous", "Morning crusting only", "Worse at night", "Throughout the day"],
      },
      {
        id: "redness",
        label: "Redness Pattern",
        type: "select",
        options: ["Diffuse conjunctival", "Peripheral", "Circumcorneal", "Tarsal"],
      },
      {
        id: "associated_symptoms",
        label: "Associated Symptoms",
        type: "multiselect",
        options: ["Itching", "Burning", "Foreign body sensation", "Photophobia", "Pain", "Lid swelling", "Crusting of lids"],
      },
      {
        id: "vision_change",
        label: "Vision Change",
        type: "select",
        options: ["No change", "Mild blurring (clears with blinking)", "Persistent blurring"],
      },
    ],
  },
  {
    id: "history",
    title: "Relevant History",
    icon: "📁",
    fields: [
      {
        id: "contact_history",
        label: "Contact History",
        type: "multiselect",
        options: ["Contact with infected person", "Exposure to sick child", "Recent URTI", "Sharing towels/pillowcases", "Swimming pool exposure"],
      },
      {
        id: "contact_lenses",
        label: "Contact Lens Use",
        type: "select",
        options: ["None", "Daily disposable", "Extended wear", "Reusable"],
      },
      {
        id: "previous_episodes",
        label: "Previous Episodes",
        type: "select",
        options: ["First episode", "Recurrent (>3/year)", "Chronic"],
      },
      {
        id: "systemic_illness",
        label: "Systemic Illness",
        type: "multiselect",
        options: ["Diabetes mellitus", "Immunocompromised", "STI (gonorrhoea, chlamydia)", "None"],
      },
      {
        id: "medications",
        label: "Current Medications / Recent Eye Drops",
        type: "textarea",
        placeholder: "List medications...",
      },
      {
        id: "allergies",
        label: "Known Allergies",
        type: "text",
        placeholder: "Drug / food allergies",
      },
    ],
  },
  {
    id: "examination",
    title: "Clinical Examination",
    icon: "🔬",
    fields: [
      {
        id: "visual_acuity",
        label: "Visual Acuity (corrected)",
        type: "text",
        placeholder: "e.g., 6/6 OD, 6/9 OS",
      },
      {
        id: "discharge_appearance",
        label: "Discharge Appearance",
        type: "select",
        options: ["Yellow-green mucopurulent", "Frank pus", "Stringy mucoid", "Watery / serous"],
      },
      {
        id: "conjunctival_changes",
        label: "Conjunctival Findings",
        type: "multiselect",
        options: ["Papillae", "Follicles", "Chemosis", "Subconjunctival haemorrhage", "Membranes / pseudomembranes"],
      },
      {
        id: "cornea",
        label: "Corneal Status",
        type: "select",
        options: ["Clear", "Superficial punctate keratitis", "Marginal infiltrates", "Ulceration"],
      },
      {
        id: "preauricular_lymph",
        label: "Pre-auricular Lymph Node",
        type: "select",
        options: ["Not palpable", "Tender & palpable", "Non-tender & palpable"],
      },
      {
        id: "lids",
        label: "Lid Findings",
        type: "multiselect",
        options: ["Normal", "Oedema", "Crusting", "Entropion / trichiasis", "Meibomian gland disease"],
      },
    ],
  },
  {
    id: "diagnosis",
    title: "Provisional Diagnosis & Plan",
    icon: "✅",
    fields: [
      {
        id: "likely_organism",
        label: "Likely Causative Organism",
        type: "select",
        options: [
          "Staphylococcus aureus",
          "Streptococcus pneumoniae",
          "Haemophilus influenzae",
          "Moraxella catarrhalis",
          "Pseudomonas aeruginosa",
          "Neisseria gonorrhoeae",
          "Chlamydia trachomatis",
          "Unknown — send swab",
        ],
      },
      {
        id: "severity",
        label: "Severity",
        type: "select",
        options: ["Mild", "Moderate", "Severe (hyperacute)"],
      },
      {
        id: "investigations",
        label: "Investigations Ordered",
        type: "multiselect",
        options: ["Conjunctival swab C&S", "Gram stain", "PCR for Chlamydia/GC", "Blood glucose", "None required"],
      },
      {
        id: "treatment",
        label: "Treatment Plan",
        type: "multiselect",
        options: [
          "Topical antibiotic drops (e.g., chloramphenicol)",
          "Topical antibiotic ointment (nocturnal)",
          "Topical fluoroquinolone (e.g., moxifloxacin)",
          "Systemic antibiotics",
          "Lid hygiene & warm compresses",
          "Lubricant eye drops",
          "Refer to ophthalmology",
          "Isolate / hygiene counselling",
        ],
      },
      {
        id: "follow_up",
        label: "Follow-up",
        type: "select",
        options: ["48–72 hours if no improvement", "1 week", "Immediate referral", "As needed"],
      },
      {
        id: "notes",
        label: "Additional Clinical Notes",
        type: "textarea",
        placeholder: "Differentials considered, special circumstances...",
      },
    ],
  },
];

const COLORS = {
  bg: "#0d1117",
  surface: "#161b22",
  border: "#21262d",
  accent: "#3fb950",
  accentDim: "#1a4a24",
  text: "#e6edf3",
  muted: "#8b949e",
  red: "#f85149",
  blue: "#58a6ff",
  yellow: "#d29922",
};

const css = `

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :host {
    display: block;
    background: ${COLORS.bg};
    color: ${COLORS.text};
    font-family: 'Sora', sans-serif;
    min-height: 100%;
  }

  .app {
    max-width: 820px;
    margin: 0 auto;
    padding: 32px 20px 80px;
  }

  .header {
    text-align: center;
    margin-bottom: 48px;
    position: relative;
  }
  .header-badge {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: ${COLORS.accent};
    letter-spacing: 0.18em;
    text-transform: uppercase;
    border: 1px solid ${COLORS.accentDim};
    padding: 4px 14px;
    border-radius: 20px;
    margin-bottom: 16px;
  }
  .header h1 {
    font-size: clamp(22px, 5vw, 34px);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .header p {
    color: ${COLORS.muted};
    font-size: 14px;
    margin-top: 8px;
    font-weight: 300;
  }
  .header-line {
    width: 48px;
    height: 3px;
    background: ${COLORS.accent};
    border-radius: 2px;
    margin: 20px auto 0;
  }

  .progress-bar-wrap {
    background: ${COLORS.border};
    border-radius: 4px;
    height: 4px;
    margin-bottom: 40px;
    overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%;
    background: ${COLORS.accent};
    border-radius: 4px;
    transition: width 0.4s ease;
  }

  .section-card {
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 12px;
    margin-bottom: 20px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .section-card.active { border-color: ${COLORS.accent}44; }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 24px;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s;
  }
  .section-header:hover { background: ${COLORS.border}55; }
  .section-icon {
    font-size: 18px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${COLORS.bg};
    border-radius: 8px;
    border: 1px solid ${COLORS.border};
    flex-shrink: 0;
  }
  .section-title {
    font-weight: 600;
    font-size: 15px;
    flex: 1;
  }
  .section-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: ${COLORS.accent};
    background: ${COLORS.accentDim};
    padding: 2px 8px;
    border-radius: 10px;
  }
  .section-chevron {
    color: ${COLORS.muted};
    font-size: 12px;
    transition: transform 0.25s;
  }
  .section-chevron.open { transform: rotate(180deg); }

  .section-body {
    padding: 0 24px 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .section-body .full-width { grid-column: 1 / -1; }

  .field-group { display: flex; flex-direction: column; gap: 6px; }
  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: ${COLORS.muted};
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  input[type="text"], input[type="number"], select, textarea {
    width: 100%;
    background: ${COLORS.bg};
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    color: ${COLORS.text};
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    padding: 10px 12px;
    outline: none;
    transition: border-color 0.2s;
  }
  input:focus, select:focus, textarea:focus {
    border-color: ${COLORS.accent}88;
  }
  textarea { resize: vertical; min-height: 80px; }
  select option { background: ${COLORS.surface}; }

  .multiselect-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .multi-chip {
    font-size: 12px;
    padding: 5px 10px;
    border-radius: 20px;
    border: 1px solid ${COLORS.border};
    cursor: pointer;
    transition: all 0.15s;
    color: ${COLORS.muted};
    background: ${COLORS.bg};
    user-select: none;
  }
  .multi-chip:hover { border-color: ${COLORS.accent}66; color: ${COLORS.text}; }
  .multi-chip.selected {
    border-color: ${COLORS.accent};
    background: ${COLORS.accentDim};
    color: ${COLORS.accent};
    font-weight: 600;
  }

  .actions {
    display: flex;
    gap: 12px;
    margin-top: 32px;
    justify-content: flex-end;
  }
  .btn {
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    font-size: 13px;
    padding: 10px 22px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.02em;
  }
  .btn-secondary {
    background: transparent;
    border: 1px solid ${COLORS.border};
    color: ${COLORS.muted};
  }
  .btn-secondary:hover { border-color: ${COLORS.muted}; color: ${COLORS.text}; }
  .btn-primary {
    background: ${COLORS.accent};
    color: #000;
  }
  .btn-primary:hover { background: #56d364; }

  /* Summary */
  .summary-wrap {
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 12px;
    overflow: hidden;
  }
  .summary-top {
    padding: 20px 24px;
    border-bottom: 1px solid ${COLORS.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .summary-top h2 { font-size: 16px; font-weight: 700; }
  .summary-table { width: 100%; border-collapse: collapse; }
  .summary-table tr { border-bottom: 1px solid ${COLORS.border}22; }
  .summary-table tr:last-child { border-bottom: none; }
  .summary-table td { padding: 10px 24px; font-size: 13px; }
  .summary-table td:first-child {
    color: ${COLORS.muted};
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    width: 200px;
  }
  .summary-section-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: ${COLORS.accent};
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 12px 24px 4px;
    background: ${COLORS.bg}66;
  }

  @media (max-width: 600px) {
    .app { padding: 24px 16px 72px; }
    .section-body { grid-template-columns: 1fr; }
    .section-body .full-width { grid-column: 1; }
    .section-header { padding: 16px 18px; }
    .section-body { padding: 0 18px 20px; }
    .actions { flex-direction: column; }
    .btn { width: 100%; text-align: center; }

    /* Summary: let the title + Edit button wrap instead of squishing, and
       stack each label above its value so values don't get a 72px column. */
    .summary-top { flex-wrap: wrap; gap: 10px; padding: 16px 18px; }
    .summary-section-label { padding: 12px 18px 4px; }
    .summary-table tr { display: block; padding: 6px 0; }
    .summary-table td { display: block; width: auto; padding: 2px 18px; }
    .summary-table td:first-child { width: auto; padding-bottom: 0; }
    .summary-table td:last-child { font-size: 14px; padding-top: 2px; padding-bottom: 6px; }
  }
`;

export default function App({ onDataChange, onSave, onExport }) {
  const [data, setData] = useState({});
  const [openSections, setOpenSections] = useState({ demographics: true });
  const [submitted, setSubmitted] = useState(false);

  // Report collected data to the store shell (kept in a ref there; no
  // re-render churn). The store's Save button writes it to IndexedDB.
  useEffect(() => {
    onDataChange?.(data);
  }, [data, onDataChange]);

  const toggleSection = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const setValue = (fieldId, value) =>
    setData((prev) => ({ ...prev, [fieldId]: value }));

  const toggleMulti = (fieldId, option) => {
    // Use the functional updater so toggling several options of the same
    // field in quick succession reads the latest state (not a stale closure).
    setData((prev) => {
      const current = prev[fieldId] || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [fieldId]: updated };
    });
  };

  const filledCount = (section) =>
    section.fields.filter((f) => {
      const v = data[f.id];
      return v && (Array.isArray(v) ? v.length > 0 : v.toString().trim() !== "");
    }).length;

  const totalFields = sections.reduce((a, s) => a + s.fields.length, 0);
  const totalFilled = sections.reduce((a, s) => a + filledCount(s), 0);
  const progress = Math.round((totalFilled / totalFields) * 100);

  if (submitted) {
    return (
      <>
        <style>{css}</style>
        <div className="app">
          <div className="header">
            <div className="header-badge">Case Record</div>
            <h1>Bacterial Conjunctivitis</h1>
            <p>Clinical Summary</p>
            <div className="header-line" />
          </div>
          <div className="summary-wrap">
            <div className="summary-top">
              <h2>Patient Case Summary</h2>
              <button className="btn btn-secondary" onClick={() => setSubmitted(false)}>
                ← Edit
              </button>
            </div>
            {sections.map((sec) => {
              const sectionData = sec.fields.filter((f) => data[f.id]);
              if (!sectionData.length) return null;
              return (
                <div key={sec.id}>
                  <div className="summary-section-label">{sec.icon} {sec.title}</div>
                  <table className="summary-table">
                    <tbody>
                      {sec.fields.map((f) => {
                        const v = data[f.id];
                        if (!v || (Array.isArray(v) && v.length === 0)) return null;
                        return (
                          <tr key={f.id}>
                            <td>{f.label}</td>
                            <td>{Array.isArray(v) ? v.join(", ") : v}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
          <div className="actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setData({});
                setOpenSections({ demographics: true });
                setSubmitted(false);
              }}
            >
              New Case
            </button>
            {onExport && (
              <button className="btn btn-secondary" onClick={onExport}>
                ⬇ Export JSON
              </button>
            )}
            {onSave && (
              <button className="btn btn-primary" onClick={onSave}>
                💾 Save to device
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div className="header-badge">Ophthalmology · Case Taking</div>
          <h1>Bacterial Conjunctivitis</h1>
          <p>Structured clinical history and examination record</p>
          <div className="header-line" />
        </div>

        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        {sections.map((section) => {
          const isOpen = !!openSections[section.id];
          const count = filledCount(section);
          return (
            <div
              key={section.id}
              className={`section-card${count > 0 ? " active" : ""}`}
            >
              <div className="section-header" onClick={() => toggleSection(section.id)}>
                <div className="section-icon">{section.icon}</div>
                <span className="section-title">{section.title}</span>
                {count > 0 && (
                  <span className="section-count">{count}/{section.fields.length}</span>
                )}
                <span className={`section-chevron${isOpen ? " open" : ""}`}>▼</span>
              </div>
              {isOpen && (
                <div className="section-body">
                  {section.fields.map((field) => {
                    const isTextArea = field.type === "textarea";
                    const isMulti = field.type === "multiselect";
                    const isSelect = field.type === "select";
                    const isText = field.type === "text" || field.type === "number";
                    const isFullWidth = isTextArea || isMulti;

                    return (
                      <div
                        key={field.id}
                        className={`field-group${isFullWidth ? " full-width" : ""}`}
                      >
                        <label className="field-label">{field.label}</label>
                        {isText && (
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            value={data[field.id] || ""}
                            onChange={(e) => setValue(field.id, e.target.value)}
                          />
                        )}
                        {isSelect && (
                          <select
                            value={data[field.id] || ""}
                            onChange={(e) => setValue(field.id, e.target.value)}
                          >
                            <option value="">— Select —</option>
                            {field.options.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        )}
                        {isTextArea && (
                          <textarea
                            placeholder={field.placeholder}
                            value={data[field.id] || ""}
                            onChange={(e) => setValue(field.id, e.target.value)}
                          />
                        )}
                        {isMulti && (
                          <div className="multiselect-wrap">
                            {field.options.map((o) => {
                              const selected = (data[field.id] || []).includes(o);
                              return (
                                <span
                                  key={o}
                                  className={`multi-chip${selected ? " selected" : ""}`}
                                  onClick={() => toggleMulti(field.id, o)}
                                >
                                  {selected ? "✓ " : ""}{o}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="actions">
          <button className="btn btn-secondary" onClick={() => { setData({}); setOpenSections({ demographics: true }); }}>
            Clear
          </button>
          <button className="btn btn-primary" onClick={() => setSubmitted(true)}>
            Generate Summary →
          </button>
        </div>
      </div>
    </>
  );
}
