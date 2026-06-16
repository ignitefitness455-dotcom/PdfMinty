import "@fontsource/inter";
import "@fontsource/jetbrains-mono";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Senior Engineer Fix: Force unregister potential stale service workers and clear local cache
// to solve persistent stale responses. We use sessionStorage as a guard to prevent infinite reloads.
if (typeof window !== "undefined") {
  const forceClear = async () => {
    if (sessionStorage.getItem("pdfminty_sw_cleared")) return;
    
    let unregistrationsPerformed = false;
    if ("serviceWorker" in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          unregistrationsPerformed = true;
        }
      } catch (err) {
        console.error("Failed to unregister SW:", err);
      }
    }
    if ("caches" in window) {
      try {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
          unregistrationsPerformed = true;
        }
      } catch (err) {
        console.error("Failed to clear caches:", err);
      }
    }
    if (unregistrationsPerformed) {
      sessionStorage.setItem("pdfminty_sw_cleared", "true");
      // Reload the page once to retrieve fresh, non-intercepted assets from the network.
      window.location.reload();
    }
  };
  forceClear();
}

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
