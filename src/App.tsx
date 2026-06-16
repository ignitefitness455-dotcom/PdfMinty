import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToolSkeleton } from "./components/ToolSkeleton";

// Modern React.lazy() code splitting for all tool pages
const HomePage = React.lazy(() => import("./pages/HomePage"));
const MergePage = React.lazy(() => import("./pages/MergePage"));
const SplitPage = React.lazy(() => import("./pages/SplitPage"));
const CompressPage = React.lazy(() => import("./pages/CompressPage"));
const RotatePage = React.lazy(() => import("./pages/RotatePage"));
const DeletePagesPage = React.lazy(() => import("./pages/DeletePagesPage"));
const ExtractPagesPdfPage = React.lazy(() => import("./pages/ExtractPagesPdfPage"));
const ReorderPdfPage = React.lazy(() => import("./pages/ReorderPdfPage"));
const WatermarkPage = React.lazy(() => import("./pages/WatermarkPage"));
const PageNumbersPage = React.lazy(() => import("./pages/PageNumbersPage"));
const AddBlankPage = React.lazy(() => import("./pages/AddBlankPage"));
const ProtectPage = React.lazy(() => import("./pages/ProtectPage"));
const UnlockPage = React.lazy(() => import("./pages/UnlockPage"));
const ImgToPdfPage = React.lazy(() => import("./pages/ImgToPdfPage"));
const PdfToImgPage = React.lazy(() => import("./pages/PdfToImgPage"));
const AiAnalyzePage = React.lazy(() => import("./pages/AiAnalyzePage"));
const IsSafePdfArticlePage = React.lazy(() => import("./pages/IsSafePdfArticlePage"));

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<ToolSkeleton />}>
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
            </Suspense>
          </Layout>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
