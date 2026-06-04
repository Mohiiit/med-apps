import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATALOG, CATEGORIES, getApp } from "./catalog.js";
import ShadowView from "./components/ShadowView.jsx";
import { saveRecord, listRecords, deleteRecord, clearAll, countRecords } from "./lib/store.js";
import { downloadJSON, printView, recordFilename } from "./lib/export.js";

function hasContent(d) {
  if (!d) return false;
  return Object.values(d).some((v) => {
    if (Array.isArray(v)) return v.length > 0;
    if (v && typeof v === "object") return Object.keys(v).length > 0;
    return v !== "" && v !== undefined && v !== null;
  });
}

function useOfflineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [swReady, setSwReady] = useState(false);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then(() => setSwReady(!!navigator.serviceWorker.controller))
        .catch(() => {});
      navigator.serviceWorker.addEventListener?.("controllerchange", () => setSwReady(true));
    }
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return { online, swReady };
}

export default function App() {
  const [view, setView] = useState("catalog"); // catalog | app | saved
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [savedCount, setSavedCount] = useState(0);
  const [toast, setToast] = useState(null);

  const { online, swReady } = useOfflineStatus();

  // Latest data reported by the launched app. Held in a ref to avoid
  // re-rendering (and remounting) the app on every keystroke.
  const dataRef = useRef(null);
  const [hasData, setHasData] = useState(false);

  const refreshCount = useCallback(() => {
    countRecords().then(setSavedCount).catch(() => {});
  }, []);
  useEffect(() => { refreshCount(); }, [refreshCount]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const onDataChange = useCallback((d) => {
    dataRef.current = d;
    setHasData(hasContent(d));
  }, []);

  const launch = (id) => {
    dataRef.current = null;
    setHasData(false);
    setActiveId(id);
    setView("app");
  };

  const app = activeId ? getApp(activeId) : null;

  const handleSave = async () => {
    if (!app || !hasContent(dataRef.current)) {
      showToast("Nothing to save yet — fill in some fields first.");
      return;
    }
    await saveRecord(app.id, app.name, dataRef.current);
    refreshCount();
    showToast("✓ Saved to this device");
  };

  const handleExport = () => {
    if (!app || !hasContent(dataRef.current)) {
      showToast("Nothing to export yet.");
      return;
    }
    downloadJSON(recordFilename(app.id), {
      app: app.id,
      appName: app.name,
      exportedAt: new Date().toISOString(),
      data: dataRef.current,
    });
    showToast("⬇ Exported JSON to your device");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter((a) => {
      const inCat = category === "All" || a.category === category;
      const inQ =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q);
      return inCat && inQ;
    });
  }, [query, category]);

  return (
    <div className={`shell${view === "app" ? " in-app" : ""}`}>
      <header className="topbar">
        <button className="brand" onClick={() => setView("catalog")}>
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="26" height="26" />
          <span>Med Apps</span>
        </button>
        <div className="topbar-right">
          <span className={`net ${!online ? "net-off" : swReady ? "net-ready" : "net-on"}`}>
            <i className="dot" />
            {!online ? "Offline · on-device" : swReady ? "Offline-ready" : "Online"}
          </span>
          <button
            className={`pill ${view === "saved" ? "pill-active" : ""}`}
            onClick={() => setView("saved")}
          >
            Saved {savedCount > 0 ? `· ${savedCount}` : ""}
          </button>
        </div>
      </header>

      {view === "catalog" && (
        <main className="catalog">
          <section className="hero">
            <h1>Offline Clinical Toolkit</h1>
            <p>
              Self-contained clinical mini-apps that work with no internet.{" "}
              <strong className="lock">🔒 Everything you enter stays on this device</strong> —
              no account, no server, no tracking.
            </p>
          </section>

          <div className="controls">
            <input
              className="search"
              type="text"
              placeholder="Search apps…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search apps"
            />
            <div className="chips">
              {["All", ...CATEGORIES].map((c) => (
                <button
                  key={c}
                  className={`chip ${category === c ? "chip-on" : ""}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid">
            {filtered.map((a) => (
              <button key={a.id} className="card" onClick={() => launch(a.id)} style={{ "--accent": a.accent }}>
                <div className="card-top">
                  <span className="card-icon" aria-hidden>{a.icon}</span>
                  <span className="card-cat">{a.category}</span>
                </div>
                <h3 className="card-title">{a.name}</h3>
                <p className="card-desc">{a.description}</p>
                <div className="card-foot">
                  {a.collects && <span className="tag-local">saves locally</span>}
                  <span className="launch">Launch →</span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="empty">No apps match “{query}”.</p>}
          </div>
        </main>
      )}

      {view === "app" && app && (
        <main className="appview">
          <div className="appbar" style={{ "--accent": app.accent }}>
            <button className="back" onClick={() => setView("catalog")} aria-label="Back to store">
              ← <span className="btn-label">Store</span>
            </button>
            <div className="appbar-title">
              <span className="appbar-icon" aria-hidden>{app.icon}</span>
              <span>{app.name}</span>
            </div>
            <div className="appbar-actions">
              {app.collects && (
                <button className="btn-save" onClick={handleSave} disabled={!hasData} aria-label="Save to device" title="Save to device">
                  💾 <span className="btn-label">Save to device</span>
                </button>
              )}
              <button className="btn-ghost" onClick={handleExport} disabled={!hasData} aria-label="Export JSON" title="Export JSON">
                ⬇ <span className="btn-label">JSON</span>
              </button>
              <button className="btn-ghost" onClick={printView} aria-label="Print / Save as PDF" title="Print / Save as PDF">
                🖨 <span className="btn-label">PDF</span>
              </button>
            </div>
          </div>
          <ShadowView className="launch-stage">
            {/* onSave/onExport let an app expose its own save action (e.g. the
                conjunctivitis summary) in addition to the top-bar buttons. */}
            <app.component onDataChange={onDataChange} onSave={handleSave} onExport={handleExport} />
          </ShadowView>
        </main>
      )}

      {view === "saved" && (
        <SavedRecords onClose={() => setView("catalog")} onChanged={refreshCount} showToast={showToast} />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function SavedRecords({ onClose, onChanged, showToast }) {
  const [records, setRecords] = useState(null);

  const load = useCallback(() => {
    listRecords().then(setRecords).catch(() => setRecords([]));
  }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    await deleteRecord(id);
    load();
    onChanged?.();
    showToast?.("Record deleted");
  };

  const wipe = async () => {
    if (!window.confirm("Delete ALL saved records from this device? This cannot be undone.")) return;
    await clearAll();
    load();
    onChanged?.();
    showToast?.("All records cleared");
  };

  const exportAll = () => {
    downloadJSON(`med-apps_backup`, {
      exportedAt: new Date().toISOString(),
      records: records || [],
    });
    showToast?.("⬇ Backup exported");
  };

  const grouped = useMemo(() => {
    const map = new Map();
    for (const r of records || []) {
      if (!map.has(r.appId)) map.set(r.appId, []);
      map.get(r.appId).push(r);
    }
    return [...map.entries()];
  }, [records]);

  return (
    <main className="saved">
      <div className="saved-head">
        <button className="back" onClick={onClose}>← Store</button>
        <h2>Saved on this device</h2>
        <div className="saved-actions">
          <button className="btn-ghost" onClick={exportAll} disabled={!records?.length}>⬇ Export all</button>
          <button className="btn-danger" onClick={wipe} disabled={!records?.length}>Clear all</button>
        </div>
      </div>

      <p className="saved-note">
        🔒 These records never left this browser. Export a backup before clearing site data —
        there is no copy anywhere else.
      </p>

      {records === null && <p className="empty">Loading…</p>}
      {records && records.length === 0 && (
        <p className="empty">No saved records yet. Open an app, fill it in, and tap “Save to device”.</p>
      )}

      {grouped.map(([appId, rows]) => {
        const meta = getApp(appId);
        return (
          <section key={appId} className="saved-group">
            <h3>
              <span aria-hidden>{meta?.icon || "📄"}</span> {meta?.name || appId}
              <span className="count">{rows.length}</span>
            </h3>
            {rows.map((r) => (
              <div key={r.id} className="rec">
                <div className="rec-main">
                  <div className="rec-title">{meta?.summarize?.(r.data) || "Record"}</div>
                  <div className="rec-time">{new Date(r.savedAt).toLocaleString()}</div>
                </div>
                <div className="rec-actions">
                  <button
                    className="btn-ghost sm"
                    onClick={() =>
                      downloadJSON(recordFilename(r.appId, r.savedAt), {
                        app: r.appId,
                        appName: r.appName,
                        savedAt: r.savedAt,
                        data: r.data,
                      })
                    }
                  >
                    ⬇
                  </button>
                  <button className="btn-danger sm" onClick={() => remove(r.id)}>✕</button>
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </main>
  );
}
