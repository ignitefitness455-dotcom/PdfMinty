import { Link, useLocation } from "react-router-dom";
import { tools } from "@/config/constants";
import * as Icons from "lucide-react";

interface RelatedToolsProps {
  currentToolId?: string;
  category?: string;
}

export function RelatedTools({ currentToolId, category }: RelatedToolsProps) {
  const { pathname } = useLocation();

  if (pathname === "/") return null;

  // If parameters are not explicitly passed, automatically determine them from current route
  const activeToolId = currentToolId || tools.find((t) => pathname.includes(t.path))?.id;
  const activeCategory = category || tools.find((t) => t.id === activeToolId)?.category || "organize";

  const related = tools
    .filter((t) => t.id !== activeToolId && t.category === activeCategory)
    .slice(0, 3);

  // Fallback to any 3 tools if no relative matches are found
  const finalRelated = related.length > 0 
    ? related 
    : tools.filter((t) => t.id !== activeToolId).slice(0, 3);

  if (!finalRelated.length) return null;

  return (
    <section className="mt-12 rounded-xl border bg-white p-6 dark:border-slate-700 dark:bg-slate-900 border-slate-200">
      <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Related Tools</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {finalRelated.map((tool) => {
          const Icon = (Icons as any)[tool.icon] || Icons.FileText;
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className="flex items-center gap-3 rounded-lg border p-3 hover:-translate-y-0.5 hover:shadow dark:border-slate-755 transition-all duration-200 border-slate-100 bg-slate-50/50 dark:bg-slate-950/20"
            >
              <Icon className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{tool.title}</p>
                <p className="text-xs text-slate-500 truncate">{tool.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default RelatedTools;
