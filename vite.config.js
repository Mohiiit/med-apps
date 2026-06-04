import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages project path: https://mohiiit.github.io/med-apps/
const BASE = "/med-apps/";

// Strict Content-Security-Policy.
// connect-src 'self' is the hard guarantee that NO collected data can be
// sent to any other origin — there is no backend, and the browser blocks
// any cross-origin fetch/XHR/WebSocket/beacon. All fonts/assets are
// self-hosted, so the app makes zero outbound requests at runtime.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'", // self-contained apps inject <style> blocks
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'", // <-- data never leaves the origin; origin has no collector
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "frame-ancestors 'self'",
].join("; ");

// Inject the CSP meta tag only into the production build. In `vite dev`,
// Vite's HMR client uses inline scripts/websockets that a strict
// script-src would block, so we keep dev relaxed and lock down prod
// (which is what we actually ship + test offline via `vite preview`).
function cspMetaPlugin() {
  return {
    name: "inject-csp-meta",
    apply: "build",
    transformIndexHtml(html) {
      const tag = `<meta http-equiv="Content-Security-Policy" content="${CSP}">`;
      return html.replace("</head>", `  ${tag}\n  </head>`);
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    cspMetaPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["icon.svg", "pwa-192.png", "pwa-512.png", "maskable-512.png"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff,woff2}"],
        // Everything is precached -> full offline after first load.
        navigateFallback: `${BASE}index.html`,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      manifest: {
        name: "Med Apps — Offline Clinical Toolkit",
        short_name: "Med Apps",
        description:
          "Offline-first store of self-contained clinical mini-apps. All data stays on this device.",
        theme_color: "#0d1117",
        background_color: "#0d1117",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  build: {
    target: "es2020",
    sourcemap: false,
  },
});
