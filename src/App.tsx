import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import HowToSchema from './components/HowToSchema';
import { HomePage } from './pages/HomePage';
import { MergePage } from './pages/MergePage';
import { SplitPage } from './pages/SplitPage';
import { CompressPage } from './pages/CompressPage';
import { RotatePage } from './pages/RotatePage';
import { DeletePagesPage } from './pages/DeletePagesPage';
import { WatermarkPage } from './pages/WatermarkPage';
import { PageNumbersPage } from './pages/PageNumbersPage';
import { AddBlankPage } from './pages/AddBlankPage';
import { ProtectPage } from './pages/ProtectPage';
import { UnlockPage } from './pages/UnlockPage';
import { ImgToPdfPage } from './pages/ImgToPdfPage';
import { PdfToImgPage } from './pages/PdfToImgPage';
import { AiAnalyzePage } from './pages/AiAnalyzePage';
import { ROUTES } from './config/routes';

export const App: React.FC = () => {
  return (
    <Layout>
      <HowToSchema />
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.MERGE} element={<MergePage />} />
        <Route path={ROUTES.SPLIT} element={<SplitPage />} />
        <Route path={ROUTES.COMPRESS} element={<CompressPage />} />
        <Route path={ROUTES.ROTATE} element={<RotatePage />} />
        <Route path={ROUTES.DELETE_PAGES} element={<DeletePagesPage />} />
        <Route path={ROUTES.WATERMARK} element={<WatermarkPage />} />
        <Route path={ROUTES.PAGE_NUMBERS} element={<PageNumbersPage />} />
        <Route path={ROUTES.ADD_BLANK} element={<AddBlankPage />} />
        <Route path={ROUTES.PROTECT} element={<ProtectPage />} />
        <Route path={ROUTES.UNLOCK} element={<UnlockPage />} />
        <Route path={ROUTES.IMG_TO_PDF} element={<ImgToPdfPage />} />
        <Route path={ROUTES.PDF_TO_IMG} element={<PdfToImgPage />} />
        <Route path={ROUTES.AI_ANALYZE} element={<AiAnalyzePage />} />
        {/* Safe fallback */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
