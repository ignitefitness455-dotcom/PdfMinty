import { Suspense, lazy } from "react";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Layout } from "./components/Layout";
import ToolSkeleton from "./components/ToolSkeleton";
import Canonical from "./components/Canonical";
import ErrorBoundary from "./components/ErrorBoundary";
import PWAController from "./components/PWAController";

// Detect if running inside Capacitor mobile app
const isCapacitor = typeof window !== "undefined" && typeof (window as any).Capacitor !== "undefined";
const Router = isCapacitor ? HashRouter : BrowserRouter;

// Lazy-loaded components for route splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const MergePage = lazy(() => import("./pages/MergePage"));
const SplitPage = lazy(() => import("./pages/SplitPage"));
const CompressPage = lazy(() => import("./pages/CompressPage"));
const RotatePage = lazy(() => import("./pages/RotatePage"));
const DeletePagesPage = lazy(() => import("./pages/DeletePagesPage"));
const WatermarkPage = lazy(() => import("./pages/WatermarkPage"));
const PageNumbersPage = lazy(() => import("./pages/PageNumbersPage"));
const AddBlankPage = lazy(() => import("./pages/AddBlankPage"));
const ProtectPage = lazy(() => import("./pages/ProtectPage"));
const UnlockPage = lazy(() => import("./pages/UnlockPage"));
const ImgToPdfPage = lazy(() => import("./pages/ImgToPdfPage"));
const PdfToImgPage = lazy(() => import("./pages/PdfToImgPage"));
const AiAnalyzePage = lazy(() => import("./pages/AiAnalyzePage"));

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <Canonical />
        <PWAController />
        <Layout>
          <ErrorBoundary>
            <Suspense fallback={<ToolSkeleton />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/merge-pdf" element={<MergePage />} />
                <Route path="/split-pdf" element={<SplitPage />} />
                <Route path="/compress-pdf" element={<CompressPage />} />
                <Route path="/rotate-pdf" element={<RotatePage />} />
                <Route path="/organize" element={<DeletePagesPage />} />
                <Route path="/watermark-pdf" element={<WatermarkPage />} />
                <Route path="/add-page-numbers" element={<PageNumbersPage />} />
                <Route path="/add-blank-page" element={<AddBlankPage />} />
                <Route path="/protect-pdf" element={<ProtectPage />} />
                <Route path="/unlock-pdf" element={<UnlockPage />} />
                <Route path="/image-to-pdf" element={<ImgToPdfPage />} />
                <Route path="/pdf-to-image" element={<PdfToImgPage />} />
                <Route path="/intelligence" element={<AiAnalyzePage />} />
                {/* Fallback routing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layout>
      </Router>
    </HelmetProvider>
  );
}
