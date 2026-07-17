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
import { lazyWithRetry } from './utils/lazyWithRetry';

// Lazy: every other route — splits each tool's code (and pdfjs/pdf-lib chunks)
// out of the initial bundle. lazyWithRetry auto-recovers from stale-chunk
// failures after a fresh deploy instead of crashing to the ErrorBoundary.
const MergePage = lazyWithRetry(() => import('./pages/MergePage').then((m) => ({ default: m.MergePage })));
const SplitPage = lazyWithRetry(() => import('./pages/SplitPage').then((m) => ({ default: m.SplitPage })));
const RotatePage = lazyWithRetry(() => import('./pages/RotatePage').then((m) => ({ default: m.RotatePage })));
const DeletePagesPage = lazyWithRetry(() => import('./pages/DeletePagesPage').then((m) => ({ default: m.DeletePagesPage })));
const ExtractPagesPdfPage = lazyWithRetry(() => import('./pages/ExtractPagesPdfPage').then((m) => ({ default: m.ExtractPagesPdfPage })));
const ReorderPdfPage = lazyWithRetry(() => import('./pages/ReorderPdfPage').then((m) => ({ default: m.ReorderPdfPage })));
const WatermarkPage = lazyWithRetry(() => import('./pages/WatermarkPage').then((m) => ({ default: m.WatermarkPage })));
const PageNumbersPage = lazyWithRetry(() => import('./pages/PageNumbersPage').then((m) => ({ default: m.PageNumbersPage })));
const AddBlankPage = lazyWithRetry(() => import('./pages/AddBlankPage').then((m) => ({ default: m.AddBlankPage })));
const ProtectPage = lazyWithRetry(() => import('./pages/ProtectPage').then((m) => ({ default: m.ProtectPage })));
const UnlockPage = lazyWithRetry(() => import('./pages/UnlockPage').then((m) => ({ default: m.UnlockPage })));
const ImgToPdfPage = lazyWithRetry(() => import('./pages/ImgToPdfPage').then((m) => ({ default: m.ImgToPdfPage })));
const PdfToImgPage = lazyWithRetry(() => import('./pages/PdfToImgPage').then((m) => ({ default: m.PdfToImgPage })));
const PdfToMarkdownPage = lazyWithRetry(() => import('./pages/PdfToMarkdownPage').then((m) => ({ default: m.PdfToMarkdownPage })));
const AiAnalyzePage = lazyWithRetry(() => import('./pages/AiAnalyzePage').then((m) => ({ default: m.AiAnalyzePage })));
const GrayscalePdfPage = lazyWithRetry(() => import('./pages/GrayscalePdfPage').then((m) => ({ default: m.GrayscalePdfPage })));
const FlattenPdfPage = lazyWithRetry(() => import('./pages/FlattenPdfPage').then((m) => ({ default: m.FlattenPdfPage })));
const RepairPdfPage = lazyWithRetry(() => import('./pages/RepairPdfPage').then((m) => ({ default: m.RepairPdfPage })));
const IsSafePdfArticlePage = lazyWithRetry(() => import('./pages/IsSafePdfArticlePage').then((m) => ({ default: m.IsSafePdfArticlePage })));
const EditMetadataPage = lazyWithRetry(() => import('./pages/EditMetadataPage').then((m) => ({ default: m.default })));
const SanitizePdfPage = lazyWithRetry(() => import('./pages/SanitizePdfPage').then((m) => ({ default: m.default })));
const BlogPage = lazyWithRetry(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const BlogPostPage = lazyWithRetry(() => import('./pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })));

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
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
              path={ROUTES.PDF_TO_MARKDOWN}
              element={
                <ErrorBoundary resetKey="pdf-to-markdown">
                  <PdfToMarkdownPage />
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
              path={ROUTES.GRAYSCALE}
              element={
                <ErrorBoundary resetKey="grayscale">
                  <GrayscalePdfPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.FLATTEN}
              element={
                <ErrorBoundary resetKey="flatten">
                  <FlattenPdfPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.REPAIR}
              element={
                <ErrorBoundary resetKey="repair">
                  <RepairPdfPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.EDIT_METADATA}
              element={
                <ErrorBoundary resetKey="edit-metadata">
                  <EditMetadataPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.SANITIZE_PDF}
              element={
                <ErrorBoundary resetKey="sanitize-pdf">
                  <SanitizePdfPage />
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
            <Route
              path={ROUTES.BLOG}
              element={
                <ErrorBoundary resetKey="blog">
                  <BlogPage />
                </ErrorBoundary>
              }
            />
            <Route
              path={ROUTES.BLOG_POST}
              element={
                <ErrorBoundary resetKey="blog-post">
                  <BlogPostPage />
                </ErrorBoundary>
              }
            />
            {/* Legacy path redirects */}
            <Route path="/edit-metadata" element={<Navigate to={ROUTES.EDIT_METADATA} replace />} />
            <Route path="/intelligence" element={<Navigate to={ROUTES.AI_ANALYZE} replace />} />

            {/* Safe fallback */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  );
};

export default App;
