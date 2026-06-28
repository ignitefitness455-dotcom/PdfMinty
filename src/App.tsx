import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import FaqSchema from './components/FaqSchema';
import HowToSchema from './components/HowToSchema';
import { Layout } from './components/Layout';
import { PWAController } from './components/PWAController';
import { SkipToContent } from './components/SkipToContent';
import ToolSkeleton from './components/ToolSkeleton';
import { ROUTES } from './config/routes';
import { HomePage } from './pages/HomePage';

// Lazy: every other route — splits each tool's code (and pdfjs/pdf-lib chunks)
// out of the initial bundle. The Suspense fallback keeps perceived load time low.
const MergePage = React.lazy(() => import('./pages/MergePage').then((m) => ({ default: m.MergePage })));
const SplitPage = React.lazy(() => import('./pages/SplitPage').then((m) => ({ default: m.SplitPage })));
const CompressPage = React.lazy(() => import('./pages/CompressPage').then((m) => ({ default: m.CompressPage })));
const RotatePage = React.lazy(() => import('./pages/RotatePage').then((m) => ({ default: m.RotatePage })));
const DeletePagesPage = React.lazy(() => import('./pages/DeletePagesPage').then((m) => ({ default: m.DeletePagesPage })));
const ExtractPagesPdfPage = React.lazy(() => import('./pages/ExtractPagesPdfPage').then((m) => ({ default: m.ExtractPagesPdfPage })));
const ReorderPdfPage = React.lazy(() => import('./pages/ReorderPdfPage').then((m) => ({ default: m.ReorderPdfPage })));
const WatermarkPage = React.lazy(() => import('./pages/WatermarkPage').then((m) => ({ default: m.WatermarkPage })));
const PageNumbersPage = React.lazy(() => import('./pages/PageNumbersPage').then((m) => ({ default: m.PageNumbersPage })));
const AddBlankPage = React.lazy(() => import('./pages/AddBlankPage').then((m) => ({ default: m.AddBlankPage })));
const ProtectPage = React.lazy(() => import('./pages/ProtectPage').then((m) => ({ default: m.ProtectPage })));
const UnlockPage = React.lazy(() => import('./pages/UnlockPage').then((m) => ({ default: m.UnlockPage })));
const ImgToPdfPage = React.lazy(() => import('./pages/ImgToPdfPage').then((m) => ({ default: m.ImgToPdfPage })));
const PdfToImgPage = React.lazy(() => import('./pages/PdfToImgPage').then((m) => ({ default: m.PdfToImgPage })));
const AiAnalyzePage = React.lazy(() => import('./pages/AiAnalyzePage').then((m) => ({ default: m.AiAnalyzePage })));
const IsSafePdfArticlePage = React.lazy(() => import('./pages/IsSafePdfArticlePage').then((m) => ({ default: m.IsSafePdfArticlePage })));

export const App: React.FC = () => {
  return (
    <>
      <SkipToContent />
      <Layout>
        <PWAController />
        <HowToSchema />
        <FaqSchema />
        <Suspense fallback={<ToolSkeleton />}>
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route
              path={ROUTES.MERGE}
              element={
                <ErrorBoundary resetKey="merge">
                  <MergePage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.SPLIT}
              element={
                <ErrorBoundary resetKey="split">
                  <SplitPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.COMPRESS}
              element={
                <ErrorBoundary resetKey="compress">
                  <CompressPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.ROTATE}
              element={
                <ErrorBoundary resetKey="rotate">
                  <RotatePage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.DELETE_PAGES}
              element={
                <ErrorBoundary resetKey="delete-pages">
                  <DeletePagesPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.EXTRACT_PAGES}
              element={
                <ErrorBoundary resetKey="extract-pages">
                  <ExtractPagesPdfPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.REORDER}
              element={
                <ErrorBoundary resetKey="reorder">
                  <ReorderPdfPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.WATERMARK}
              element={
                <ErrorBoundary resetKey="watermark">
                  <WatermarkPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.PAGE_NUMBERS}
              element={
                <ErrorBoundary resetKey="page-numbers">
                  <PageNumbersPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.ADD_BLANK}
              element={
                <ErrorBoundary resetKey="add-blank">
                  <AddBlankPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.PROTECT}
              element={
                <ErrorBoundary resetKey="protect">
                  <ProtectPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.UNLOCK}
              element={
                <ErrorBoundary resetKey="unlock">
                  <UnlockPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.IMG_TO_PDF}
              element={
                <ErrorBoundary resetKey="img-to-pdf">
                  <ImgToPdfPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.PDF_TO_IMG}
              element={
                <ErrorBoundary resetKey="pdf-to-img">
                  <PdfToImgPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.AI_ANALYZE}
              element={
                <ErrorBoundary resetKey="ai-analyze">
                  <AiAnalyzePage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.TRUST_ARTICLE}
              element={
                <ErrorBoundary resetKey="trust-article">
                  <IsSafePdfArticlePage />
                </ErrorBoundary>
              }
            />
            {/* Safe fallback */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  );
};

export default App;
