import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import FaqSchema from './components/FaqSchema';
import HowToSchema from './components/HowToSchema';
import { Layout } from './components/Layout';
import { PWAController } from './components/PWAController';
import { SkipToContent } from './components/SkipToContent';
import { ROUTES } from './config/routes';
import { AddBlankPage } from './pages/AddBlankPage';
import { AiAnalyzePage } from './pages/AiAnalyzePage';
import { CompressPage } from './pages/CompressPage';
import { DeletePagesPage } from './pages/DeletePagesPage';
import { ExtractPagesPdfPage } from './pages/ExtractPagesPdfPage';
import { HomePage } from './pages/HomePage';
import { ImgToPdfPage } from './pages/ImgToPdfPage';
import { IsSafePdfArticlePage } from './pages/IsSafePdfArticlePage';
import { MergePage } from './pages/MergePage';
import { PageNumbersPage } from './pages/PageNumbersPage';
import { PdfToImgPage } from './pages/PdfToImgPage';
import { ProtectPage } from './pages/ProtectPage';
import { ReorderPdfPage } from './pages/ReorderPdfPage';
import { RotatePage } from './pages/RotatePage';
import { SplitPage } from './pages/SplitPage';
import { UnlockPage } from './pages/UnlockPage';
import { WatermarkPage } from './pages/WatermarkPage';

export const App: React.FC = () => {
  return (
    <>
      <SkipToContent />
      <Layout>
        <PWAController />
        <HowToSchema />
        <FaqSchema />
        <ErrorBoundary>
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
        </ErrorBoundary>
      </Layout>
    </>
  );
};

export default App;
