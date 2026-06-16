import "@fontsource/inter";
import "@fontsource/jetbrains-mono";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { Layout } from "./components/Layout";
import HomePage from "./pages/HomePage";
import "./index.css";

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
