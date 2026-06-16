import "@fontsource/inter";
import "@fontsource/jetbrains-mono";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// The legacy brute-force cache clearing logic has been removed.
// We now ship a real versioned Service Worker (sw.js) which uses skipWaiting()
// and clients.claim() to forcefully activate, and its activate handler
// deletes any old Cache Storage buckets safely, guaranteeing recovery from stale state.

// Initialize multilingual translations
import "./config/i18n";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
