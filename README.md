# Med Apps — Offline Clinical Toolkit

A static, installable **PWA app-store** for self-contained clinical mini-apps.
The site itself is public, but **everything a user enters stays on their own
device** — there is no account, no server, and no network egress of any kind.

🔗 Live (after first deploy): `https://mohiiit.github.io/med-apps/`

## What it is

- A **catalog / launcher** of small, dependency-free clinical tools.
- Each tool is a single self-contained React component launched in an
  **isolated Shadow DOM** so apps with conflicting themes/CSS never collide.
- **Offline-first**: a service worker precaches the entire app (shell, React,
  fonts, every mini-app) on first visit. After that it works with **no
  internet** — load it once on wifi, then use it anywhere.

### Bundled apps

| App | Category | What it does |
|-----|----------|--------------|
| **Bacterial Conjunctivitis** | Ophthalmology | Structured clinical history & examination record |
| **Acute Mountain Sickness** | Altitude / Emergency | Lake Louise Score 2018 + HACE risk + management guidance |

## The privacy guarantee — "data never leaves the device"

This is enforced by construction, not by promise. Three independent layers:

1. **No backend.** It's a static site on GitHub Pages. There is no endpoint
   that *could* receive data.
2. **No outbound requests at runtime.** All fonts and assets are self-hosted
   (the original artifacts' Google-Fonts `@import`s were stripped and replaced
   with bundled [`@fontsource`](https://fontsource.org) fonts). At runtime the
   app fetches *nothing*.
3. **A strict Content-Security-Policy** (injected into the production
   `index.html`) with `connect-src 'self'`, `img-src 'self' data:`,
   `default-src 'self'`. The **browser itself blocks** any cross-origin
   `fetch`, `XHR`, `WebSocket`, `sendBeacon`, or image-pixel beacon — verified
   with `securitypolicyviolation` events during testing.

### Where collected data lives

- Saved records go to **IndexedDB**, on-device only. They survive reloads and
  full offline use, and are visible/manageable in the **Saved** panel.
- "Export" = a local **JSON download** or **Print → Save as PDF**. Both are
  user-initiated and on-device; nothing is uploaded.
- Because there is no copy anywhere else, **export a backup before clearing
  browser/site data** — that's the only thing that erases records.
- No cross-device sync (that would require a server). Move data between devices
  via the JSON export/import.

## Develop

```bash
npm install
npm run icons      # rasterize PWA icons from public/icon.svg (needs sharp)
npm run dev        # http://localhost:5173/med-apps/  (HMR; CSP relaxed in dev)
npm run build      # production build -> dist/  (strict CSP + service worker)
npm run preview    # serve the production build (this is what's tested offline)
```

> The strict CSP is injected **only in the production build** because Vite's dev
> HMR uses inline scripts a strict `script-src` would block. Validate the real
> security posture with `npm run preview`.

## Add a new app

1. Drop a self-contained component in `src/apps/` that
   `export default function App({ onDataChange })`. Call `onDataChange(data)`
   whenever its state changes if you want the store's **Save to device** button
   to persist it.
2. If it ships its own CSS via `<style>`, style the root with `:host { … }`
   (not `body`) so it renders correctly inside the Shadow DOM, and **self-host
   any fonts** (no external `@import`).
3. Add an entry to `src/catalog.js`.
4. `git push` — the GitHub Action rebuilds and redeploys.

## Architecture

```
index.html ──> src/main.jsx ──> src/App.jsx  (store shell: catalog/search/launch/saved)
                                   │
                                   ├─ components/ShadowView.jsx   (per-app Shadow DOM isolation)
                                   ├─ apps/*.jsx                  (self-contained mini-apps)
                                   ├─ lib/store.js                (IndexedDB, on-device only)
                                   ├─ lib/export.js               (JSON download / print-to-PDF)
                                   └─ lib/fonts.js                (self-hosted @fontsource)
vite.config.js ─ base /med-apps/, vite-plugin-pwa (Workbox), build-only CSP injection
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes `dist/` to GitHub Pages. Enable Pages once under
**Settings → Pages → Source: GitHub Actions**.
