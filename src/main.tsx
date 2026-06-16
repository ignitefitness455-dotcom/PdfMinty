import "@fontsource/inter";
import "@fontsource/jetbrains-mono";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { Layout } from "./components/Layout";
import HomePage from "./pages/HomePage";
import MergePage from "./pages/MergePage";
import SplitPage from "./pages/SplitPage";
import CompressPage from "./pages/CompressPage";
import RotatePage from "./pages/RotatePage";
import DeletePagesPage from "./pages/DeletePagesPage";
import ExtractPagesPdfPage from "./pages/ExtractPagesPdfPage";
import ReorderPdfPage from "./pages/ReorderPdfPage";
import WatermarkPage from "./pages/WatermarkPage";
import PageNumbersPage from "./pages/PageNumbersPage";
import AddBlankPage from "./pages/AddBlankPage";
import ProtectPage from "./pages/ProtectPage";
import UnlockPage from "./pages/UnlockPage";
import ImgToPdfPage from "./pages/ImgToPdfPage";
import PdfToImgPage from "./pages/PdfToImgPage";
import AiAnalyzePage from "./pages/AiAnalyzePage";
import IsSafePdfArticlePage from "./pages/IsSafePdfArticlePage";
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

const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/merge-pdf" element={<MergePage />} />
            <Route path="/split-pdf" element={<SplitPage />} />
            <Route path="/compress-pdf" element={<CompressPage />} />
            <Route path="/rotate-pdf" element={<RotatePage />} />
            <Route path="/organize" element={<DeletePagesPage />} />
            <Route path="/delete-pages-pdf" element={<DeletePagesPage />} />
            <Route path="/extract-pages-pdf" element={<ExtractPagesPdfPage />} />
            <Route path="/reorder-pdf" element={<ReorderPdfPage />} />
            <Route path="/watermark-pdf" element={<WatermarkPage />} />
            <Route path="/add-page-numbers" element={<PageNumbersPage />} />
            <Route path="/add-blank-page" element={<AddBlankPage />} />
            <Route path="/protect-pdf" element={<ProtectPage />} />
            <Route path="/unlock-pdf" element={<UnlockPage />} />
            <Route path="/image-to-pdf" element={<ImgToPdfPage />} />
            <Route path="/pdf-to-image" element={<PdfToImgPage />} />
            <Route path="/intelligence" element={<AiAnalyzePage />} />
            <Route path="/is-it-safe-to-upload-pdf-to-online-tools" element={<IsSafePdfArticlePage />} />
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
