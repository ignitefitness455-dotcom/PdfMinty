export default function ToolSkeleton() {
  return (
    <div id="loading-tool-skeleton" className="animate-pulse max-w-4xl mx-auto p-6 space-y-6">
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3"></div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/2"></div>
    </div>
  );
}
