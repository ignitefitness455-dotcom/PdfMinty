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

// FIX: The skeleton is now removed AFTER React's first render completes,
// not before. Previously it was removed synchronously before createRoot().render(),
// which caused a DOM flash during lazy-loaded route transitions and could
// drop file state in tools that load PDF previews asynchronously.
// requestAnimationFrame ensures removal happens after the browser has painted.
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

requestAnimationFrame(() => {
  const skeleton = document.getElementById('loading-skeleton');
  if (skeleton) skeleton.remove();
});
