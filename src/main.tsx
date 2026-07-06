import './polyfill';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

import App from './App.tsx';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';
import { setupErrorTelemetry, FileProcessingProvider } from './error-handler';

// Initialize global error telemetry
setupErrorTelemetry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ToastProvider>
          <FileProcessingProvider>
            <App />
          </FileProcessingProvider>
        </ToastProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
