import ConjunctivitisApp from "./apps/ConjunctivitisApp.jsx";
import AmsScoringApp from "./apps/AmsScoringApp.jsx";

// The store catalog. Adding a new clinical mini-app = drop a self-contained
// component in src/apps/ and add an entry here, then `git push` (the deploy
// workflow rebuilds). Each app is launched in an isolated Shadow DOM.
//
// `summarize(data)` produces a one-line label for a saved record, so the
// Saved Records panel can show something meaningful per app.
export const CATALOG = [
  {
    id: "conjunctivitis-case",
    name: "Bacterial Conjunctivitis",
    category: "Ophthalmology",
    icon: "👁",
    accent: "#3fb950",
    description:
      "Structured clinical history & examination record for bacterial conjunctivitis. Capture demographics, symptoms, findings and a treatment plan.",
    collects: true,
    component: ConjunctivitisApp,
    summarize: (d) => {
      if (!d) return "Case record";
      const name = d.name || "Unnamed patient";
      const eye = d.eye_involved ? ` · ${d.eye_involved}` : "";
      return `${name}${eye}`;
    },
  },
  {
    id: "ams-scoring",
    name: "Acute Mountain Sickness",
    category: "Altitude / Emergency",
    icon: "⛰",
    accent: "#f97316",
    description:
      "Lake Louise Score 2018 calculator with HACE risk assessment and evidence-based management guidance for high-altitude emergencies.",
    collects: true,
    component: AmsScoringApp,
    summarize: (d) => {
      if (!d) return "Assessment";
      const alt = d.altitude ? `${d.altitude}m · ` : "";
      const lls = d.llsLabel || `LLS ${d.llsTotal ?? 0}`;
      return `${alt}${lls}`;
    },
  },
];

export const CATEGORIES = [...new Set(CATALOG.map((a) => a.category))];

export function getApp(id) {
  return CATALOG.find((a) => a.id === id) || null;
}
