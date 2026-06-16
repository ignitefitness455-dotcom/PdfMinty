import React, { useEffect } from "react";

export const PWAController: React.FC = () => {
  useEffect(() => {
    const isTopFrame = typeof window !== "undefined" && window.self === window.top;
    const isSWSupported = typeof navigator !== "undefined" && "serviceWorker" in navigator;

    if (isTopFrame && isSWSupported) {
      const swUrl = "/sw.js";
      navigator.serviceWorker.register(swUrl)
        .then((reg) => {
          console.log("Service Worker registered on PWAController with scope:", reg.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed on PWAController:", err);
        });
    }
  }, []);

  return null;
};

export default PWAController;
