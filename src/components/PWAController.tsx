import React, { useEffect } from "react";
import { useToast } from "../contexts/ToastContext";

export const PWAController: React.FC = () => {
  const { showToast } = useToast();

  useEffect(() => {
    const isTopFrame = typeof window !== "undefined" && window.self === window.top;
    const isSWSupported = typeof navigator !== "undefined" && "serviceWorker" in navigator;

    // Registers sw.js on mount (only in production)
    if (isTopFrame && isSWSupported && import.meta.env.PROD) {
      const swUrl = "/sw.js";
      navigator.serviceWorker.register(swUrl)
        .then((reg) => {
          console.log("Service Worker registered on PWAController with scope:", reg.scope);

          // Checks for updates every 60 minutes
          const updateInterval = setInterval(() => {
            reg.update().catch((err) => console.error("SW manual update failed:", err));
          }, 60 * 60 * 1000);

          const handleUpdate = (worker: ServiceWorker) => {
            // Shows toast notification when update available
            showToast("Update available. Click to refresh.", "info");

            // Handles skipWaiting for immediate activation
            worker.postMessage({ type: "SKIP_WAITING" });
          };

          // If there is already a waiting worker
          if (reg.waiting) {
            handleUpdate(reg.waiting);
          }

          // Listen for future updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            newWorker?.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && reg.waiting) {
                handleUpdate(reg.waiting);
              }
            });
          });

          return () => {
            clearInterval(updateInterval);
          };
        })
        .catch((err) => {
          console.error("Service Worker registration failed on PWAController:", err);
        });

      // Prevents stale content by forcing reload on update
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, [showToast]);

  return null;
};

export default PWAController;
