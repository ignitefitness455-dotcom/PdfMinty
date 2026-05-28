import './polyfill.ts';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handler to help debug on mobile without destroying the app
const showErrorOverlay = (title: string, message: string, details?: string) => {
  if (message.includes('failed to connect to websocket')) return; // Ignore expected Vite HMR errors
  if (message.includes('ResizeObserver')) return; // Ignore benign ResizeObserver errors

  const div = document.createElement('div');
  div.style.cssText = 'position: fixed; bottom: 20px; right: 20px; left: 20px; background: white; padding: 15px; border: 1px solid red; border-radius: 8px; z-index: 99999; box-shadow: 0 10px 25px rgba(0,0,0,0.2); max-height: 50vh; overflow-y: auto; font-family: monospace; font-size: 12px;';
  div.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h3 style="color: red; margin: 0; font-size: 14px; font-weight: bold;">${title}</h3>
      <button onclick="this.parentElement.parentElement.remove()" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 8px; cursor: pointer;">Close</button>
    </div>
    <p style="margin: 0 0 8px 0; color: #333; word-break: break-all;"><strong>Message:</strong> ${message}</p>
    ${details ? `<details><summary style="cursor: pointer; color: #64748b;">Stack Trace</summary><pre style="margin-top: 8px; white-space: pre-wrap; word-break: break-all; color: #64748b;">${details}</pre></details>` : ''}
  `;
  document.body.appendChild(div);
};

window.addEventListener('error', (event) => {
  showErrorOverlay('Runtime Error', event.message, event.error?.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  showErrorOverlay('Unhandled Promise Rejection', String(event.reason), event.reason?.stack);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
