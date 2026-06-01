import './polyfill.ts';
import './error-handler.ts';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import './index.css';

// Production-এ error silently log করে, user-কে দেখায় না
// ErrorBoundary already handles React errors
// Global errors শুধু console-এ
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  event.preventDefault(); // ✅ Default browser error page বন্ধ
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
  event.preventDefault();
});

// Remove loading skeleton once React mounts
const skeleton = document.getElementById('loading-skeleton');
if (skeleton) skeleton.remove();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>
);
