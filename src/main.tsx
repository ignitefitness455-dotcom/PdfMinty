import "@fontsource/inter";
import "@fontsource/jetbrains-mono";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { Layout } from "./components/Layout";
import HomePage from "./pages/HomePage";
import "./index.css";

// Senior Engineer Fix: Force unregister potential stale service workers and clear local cache
// to solve persistent 'ok' responses cached in strict browsers like Brave.
if (typeof window !== "undefined") {
  const forceClear = async () => {
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
      // Reload the page once to retrieve fresh, non-intercepted assets from the network.
      window.location.reload();
    }
  };
  forceClear();
}

// Initialize multilingual translations
import "./config/i18n";

const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ToastProvider>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
