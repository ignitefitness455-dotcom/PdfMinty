export function ToolSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-32 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-10 w-32 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export default ToolSkeleton;
