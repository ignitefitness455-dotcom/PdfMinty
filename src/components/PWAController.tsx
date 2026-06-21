import { RefreshCw, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export const PWAController: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // 1. Guard conditions: No iframe (window.self === window.top) and support verification
    const isInsideIframe = window.self !== window.top;
    const isServiceWorkerSupported = 'serviceWorker' in navigator;
    const isSecureContext =
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (isInsideIframe || !isServiceWorkerSupported || !isSecureContext) {
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        setRegistration(reg);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // There is a new updated service worker waiting to activate!
                setShowToast(true);
              }
            });
          }
        });

        // If a service worker is already waiting to activate when we open the app
        if (reg.waiting) {
          setShowToast(true);
        }
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });

    // Handle controller change (service worker activated)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowToast(false);
  };

  if (!showToast) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/50 p-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
      id="pwa_update_toast"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
          <RefreshCw className="w-5 h-5 animate-spin-slow" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-bold tracking-tight">App Update Available</p>
          <p className="text-xs text-slate-400 leading-normal">
            A newer version has loaded in the background. Refresh now to experience the latest upgrades.
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={handleUpdate}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-xs font-bold text-slate-900 rounded-lg transition-all"
            >
              Update Now
            </button>
            <button
              onClick={() => setShowToast(false)}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowToast(false)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
