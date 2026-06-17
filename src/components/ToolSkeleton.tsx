import React from "react";

export function ToolSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse" id="tool-loading-skeleton">
      {/* Title skeleton */}
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3" />
      
      {/* Upload area skeleton */}
      <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
      
      {/* Button skeleton */}
      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/2" />
    </div>
  );
}

export default ToolSkeleton;
