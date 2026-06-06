import React, { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import WifiOff from "lucide-react/icons/wifi-off";
import Wifi from "lucide-react/icons/wifi";
import RefreshCw from "lucide-react/icons/refresh-cw";
import CloudLightning from "lucide-react/icons/cloud-lightning";
import X from "lucide-react/icons/x";

export const PWAController: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showNetworkBanner, setShowNetworkBanner] = useState<boolean>(false);
  const [bannerType, setBannerType] = useState<"online" | "offline">("online");

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log("Service Worker successfully registered at URL:", swUrl, "Registration state:", r);
    },
    onRegisterError(error) {
      console.error("Service worker registration problem:", error);
    },
  });

  // Track network connectivity states
  useEffect(() => {
    console.log("PWA network status checker loaded. Initial state: online =", isOnline);
  }, [isOnline]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setBannerType("online");
      setShowNetworkBanner(true);
      // Auto-hide online banner after a brief duration
      const timer = setTimeout(() => {
        setShowNetworkBanner(false);
      }, 5000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setBannerType("offline");
      setShowNetworkBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleReloadUpdate = () => {
    updateServiceWorker(true);
  };

  return (
    <div className="font-sans relative z-50">
      {/* 1. Offline Connectivity Fallback Banner */}
      {showNetworkBanner && bannerType === "offline" && (
        <div className="fixed top-20 inset-x-4 max-w-lg mx-auto bg-slate-900 border border-slate-800 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-start gap-3.5 animate-slideup md:top-24">
          <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg shrink-0 mt-0.5">
            <WifiOff className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-black tracking-wider uppercase text-rose-400">Offline Fallback</h4>
            <p className="text-xs font-bold text-slate-300 mt-0.5 leading-relaxed">
              You are currently offline. Basic PDF operations (merge, split, rotate, protecting, and local compression) still work fully on your device without an internet connection.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNetworkBanner(false)}
            className="text-slate-400 hover:text-white transition-all cursor-pointer border-0 bg-transparent p-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
            aria-label="Dismiss offline banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showNetworkBanner && bannerType === "online" && (
        <div className="fixed top-20 inset-x-4 max-w-lg mx-auto bg-emerald-950 border border-emerald-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-start gap-3.5 animate-slideup md:top-24">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5">
            <Wifi className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-black tracking-wider uppercase text-emerald-400">Welcome Back</h4>
            <p className="text-xs font-bold text-slate-300 mt-0.5 leading-relaxed">
              Your network connection is restored. Extended online integrations are synchronized.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNetworkBanner(false)}
            className="text-slate-400 hover:text-white transition-all cursor-pointer border-0 bg-transparent p-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
            aria-label="Dismiss online banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Cache-Ready Initial PWA Notification */}
      {offlineReady && (
        <div className="fixed bottom-6 left-6 max-w-sm bg-indigo-950 border border-indigo-900 text-white p-5 rounded-2xl shadow-2xl flex items-start gap-3.5 animate-slideup">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0">
            <CloudLightning className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-extrabold text-indigo-300">Offline Mode Active</p>
            <p className="text-[11px] font-semibold text-slate-300 mt-1 leading-normal">
              PDFMinty is cached locally! The application runs completely offline anytime.
            </p>
            <button
              type="button"
              onClick={() => setOfflineReady(false)}
              className="mt-2.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-[10px] font-black tracking-wider uppercase rounded-lg text-white cursor-pointer border-0 transition-colors"
            >
              Great!
            </button>
          </div>
          <button
            type="button"
            onClick={() => setOfflineReady(false)}
            className="text-slate-400 hover:text-white transition-all cursor-pointer border-0 bg-transparent p-1 focus:outline-none"
            aria-label="Close message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. New PWA Version Update Notification */}
      {needRefresh && (
        <div className="fixed bottom-6 left-6 max-w-sm bg-slate-900 border border-emerald-500/30 text-white p-5 rounded-2xl shadow-2xl flex items-start gap-3.5 animate-slideup ring-4 ring-emerald-500/5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">Update Available</p>
            <p className="text-[11px] font-semibold text-slate-300 mt-1 leading-normal">
              A newer, secure version of PDFMinty is waiting. Reload to update immediately.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={handleReloadUpdate}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-[10px] font-black tracking-wider uppercase rounded-lg text-white cursor-pointer border-0 transition-colors shadow-lg shadow-emerald-500/20"
              >
                Reload Now
              </button>
              <button
                type="button"
                onClick={() => setNeedRefresh(false)}
                className="px-3 py-1.5 border border-slate-800 hover:bg-slate-800 text-[10px] font-black tracking-wider uppercase rounded-lg text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            className="text-slate-400 hover:text-white transition-all cursor-pointer border-0 bg-transparent p-1 focus:outline-none"
            aria-label="Dismiss update notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PWAController;
