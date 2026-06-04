// Self-host every typeface used by the bundled apps so there are ZERO
// requests to Google Fonts (or anywhere) at runtime. @fontsource injects
// @font-face rules into the document <head>; because @font-face is
// document-global, these fonts are also available inside the Shadow DOM
// roots that each app renders into.
//
// Weights below match exactly what the apps' CSS references.

// Conjunctivitis app: Sora + JetBrains Mono
import "@fontsource/sora/300.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";

// AMS app: IBM Plex Sans + IBM Plex Mono + Bebas Neue
import "@fontsource/ibm-plex-sans/300.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource/bebas-neue/400.css";
