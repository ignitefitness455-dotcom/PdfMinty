import React from "react";

/**
 * SkipToContent component is the very first interactive node in the DOM.
 * Visually hidden by default using Tailwind's 'sr-only', it becomes fully
 * visible, focus-styled, and keyboard-activated upon receiving keyboard Tab focus.
 */
export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-5 focus:py-3 focus:bg-indigo-600 focus:hover:bg-indigo-700 focus:text-white focus:text-xs focus:font-black focus:uppercase focus:tracking-wider focus:rounded-2xl focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/40 transition-all duration-150 border-0"
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;
