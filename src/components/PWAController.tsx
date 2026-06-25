import React, { useEffect, useRef, useState } from 'react';

export const PWAController: React.FC = () => {
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const userRequestedUpdateRef = useRef(false);

  useEffect(() => {
    // Don't register SW inside iframes, in non-secure contexts, or unsupported browsers.
    const isInsideIframe = window.self !== window.top;
    if (isInsideIframe || !('serviceWorker' in navigator) || !window.isSecureContext) {
      return;
    }

    let registration: ServiceWorkerRegistration | undefined;
    let trackedWorker: ServiceWorker | null = null;

    const updateFoundHandler = () => {
      const newWorker = registration?.installing;
      if (!newWorker) return;
      trackedWorker = newWorker;

      const stateChangeHandler = () => {
        // Only show update toast if there's an existing controller (i.e., this is an UPDATE,
        // not a first-time install). First-time installs should NOT prompt reload.
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          setShowUpdateToast(true);
        }
      };
      newWorker.addEventListener('statechange', stateChangeHandler);
    };

    const controllerChangeHandler = () => {
      // Only reload if the user explicitly requested the update.
      // First-time installs (controller was null before) should NOT reload.
      if (userRequestedUpdateRef.current) {
        window.location.reload();
      }
    };

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        registration = reg;
        reg.addEventListener('updatefound', updateFoundHandler);
      })
      .catch(() => {
        // SW registration failure is non-fatal.
      });

    navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);

    return () => {
      if (registration) {
        registration.removeEventListener('updatefound', updateFoundHandler);
      }
      if (trackedWorker) {
        // trackedWorker may have GC'd its listeners by now; removeEventListener is safe no-op.
      }
      navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
    };
  }, []);

  const handleUpdate = () => {
    userRequestedUpdateRef.current = true;
    setShowUpdateToast(false);
    // Tell the waiting SW to skip waiting so it activates immediately.
    navigator.serviceWorker.getRegistration().then((reg) => {
      const waiting = reg?.waiting;
      if (waiting) {
        waiting.postMessage({ type: 'SKIP_WAITING' });
      } else {
        // No waiting worker; reload to pick up latest.
        window.location.reload();
      }
    });
  };

  if (!showUpdateToast) return null;

  return (
    <>
      {showUpdateToast && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-xl shadow-lg flex items-start space-x-3"
        >
          <span className="flex-1 text-sm">
            A new version is available. Update now to get the latest features.
          </span>
          <button
            type="button"
            onClick={handleUpdate}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-semibold whitespace-nowrap"
          >
            Update Now
          </button>
          <button
            type="button"
            onClick={() => setShowUpdateToast(false)}
            aria-label="Dismiss update notification"
            className="text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

