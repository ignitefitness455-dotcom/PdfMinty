import React, { Suspense, lazy } from "react";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Layout } from "./components/Layout";
import ToolSkeleton from "./components/ToolSkeleton";
import Canonical from "./components/Canonical";

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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an uncaught exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl font-sans text-left">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-50 mt-3">
            An Uncaught Application Error Occurred
          </h2>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            The application has encountered an unexpected runtime failure inside the client viewport.
          </p>
          {import.meta.env.DEV && this.state.error?.stack && (
            <pre className="mt-4 p-4 bg-slate-55 dark:bg-black text-[10px] text-rose-500 font-mono rounded-xl overflow-x-auto max-h-48 text-left selection:bg-rose-100 select-all leading-normal">
              {this.state.error.stack}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer border-0"
          >
            Reload PDF Studio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <Canonical />
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
