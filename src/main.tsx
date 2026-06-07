import './polyfill.ts';
import './error-handler.ts';
import './config/i18n.ts';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import './index.css';

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
  event.preventDefault();
});

// FIX: requestAnimationFrame() সরিয়ে দেওয়া হয়েছে।
// Skeleton removal এখন App.tsx-এর useEffect()-এ হয়,
// যা React-এর প্রথম real DOM commit-এর পরে fire করে।
// এটি নিশ্চিত করে যে skeleton সরার আগে React content দৃশ্যমান।
const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>
);
