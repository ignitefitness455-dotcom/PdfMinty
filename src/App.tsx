import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

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
  const location = useLocation();
  return (
    <>
      <SkipToContent />
      <Layout>
        <PWAController />
        <HowToSchema />
        <FaqSchema />
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<ToolSkeleton />}>
            <Routes>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.MERGE} element={<MergePage />} />
              <Route path={ROUTES.SPLIT} element={<SplitPage />} />
              <Route path={ROUTES.COMPRESS} element={<CompressPage />} />
              <Route path={ROUTES.ROTATE} element={<RotatePage />} />
              <Route path={ROUTES.DELETE_PAGES} element={<DeletePagesPage />} />
              <Route path={ROUTES.EXTRACT_PAGES} element={<ExtractPagesPdfPage />} />
              <Route path={ROUTES.REORDER} element={<ReorderPdfPage />} />
              <Route path={ROUTES.WATERMARK} element={<WatermarkPage />} />
              <Route path={ROUTES.PAGE_NUMBERS} element={<PageNumbersPage />} />
              <Route path={ROUTES.ADD_BLANK} element={<AddBlankPage />} />
              <Route path={ROUTES.PROTECT} element={<ProtectPage />} />
              <Route path={ROUTES.UNLOCK} element={<UnlockPage />} />
              <Route path={ROUTES.IMG_TO_PDF} element={<ImgToPdfPage />} />
              <Route path={ROUTES.PDF_TO_IMG} element={<PdfToImgPage />} />
              <Route path={ROUTES.AI_ANALYZE} element={<AiAnalyzePage />} />
              <Route path={ROUTES.TRUST_ARTICLE} element={<IsSafePdfArticlePage />} />
              {/* Safe fallback */}
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </>
  );
};

export default App;
