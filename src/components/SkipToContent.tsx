import React from "react";

export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded-lg font-extrabold z-50 shadow-xl border border-emerald-500"
    >
      Skip to content
    </a>
  );
};
