import React from "react";
import { Loader2 } from "lucide-react";

export function ToolSkeleton() {
  return (
    <div
      className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-pulse font-sans"
      id="tool-loading-skeleton"
    >
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Main Workspace Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.015)] space-y-6">
        <div className="h-48 w-full bg-slate-100 dark:bg-slate-950/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin opacity-40" />
          <span className="text-xs text-slate-450 dark:text-slate-500 font-semibold tracking-wider">
            PREPARING PRIVATE TOOL STACK...
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Details/Explanation Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="space-y-3">
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-full bg-slate-150 dark:bg-slate-850 rounded-lg" />
          <div className="h-4 w-5/6 bg-slate-150 dark:bg-slate-850 rounded-lg" />
        </div>
        <div className="space-y-3">
          <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-full bg-slate-150 dark:bg-slate-850 rounded-lg" />
          <div className="h-4 w-2/3 bg-slate-150 dark:bg-slate-850 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
