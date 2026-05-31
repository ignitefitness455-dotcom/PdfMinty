import './polyfill.ts';
import './error-handler.ts';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handler to help debug on mobile without destroying the app
const isDev = import.meta.env.DEV;

const showErrorOverlay = (title: string, message: string, details?: string) => {
  if (message.includes('failed to connect to websocket')) return; // Ignore expected Vite HMR errors
  if (message.includes('ResizeObserver')) return; // Ignore benign ResizeObserver errors

  const div = document.createElement('div');
  div.style.cssText = 'position: fixed; bottom: 20px; right: 20px; left: 20px; background: white; padding: 15px; border: 1px solid red; border-radius: 8px; z-index: 99999; box-shadow: 0 10px 25px rgba(0,0,0,0.2); max-height: 50vh; overflow-y: auto; font-family: monospace; font-size: 12px;';

  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;';

  const h3 = document.createElement('h3');
  h3.style.cssText = 'color: red; margin: 0; font-size: 14px; font-weight: bold;';
  h3.textContent = title;

  const btn = document.createElement('button');
  btn.style.cssText = 'background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 8px; cursor: pointer;';
  btn.textContent = 'Close';
  btn.addEventListener('click', () => {
    div.remove();
  });

  header.appendChild(h3);
  header.appendChild(btn);
  div.appendChild(header);

  const p = document.createElement('p');
  p.style.cssText = 'margin: 0 0 8px 0; color: #333; word-break: break-all;';
  const strong = document.createElement('strong');
  strong.textContent = 'Message: ';
  p.appendChild(strong);
  p.appendChild(document.createTextNode(message));
  div.appendChild(p);

  if (details && isDev) {
    const detailsEl = document.createElement('details');
    
    const summary = document.createElement('summary');
    summary.style.cssText = 'cursor: pointer; color: #64748b;';
    summary.textContent = 'Stack Trace';
    
    const pre = document.createElement('pre');
    pre.style.cssText = 'margin-top: 8px; white-space: pre-wrap; word-break: break-all; color: #64748b;';
    pre.textContent = details;

    detailsEl.appendChild(summary);
    detailsEl.appendChild(pre);
    div.appendChild(detailsEl);
  }

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
