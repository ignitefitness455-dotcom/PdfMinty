import { Link, useLocation } from "react-router-dom";
import { useLayout } from "./Layout";
import { ChevronRight } from "lucide-react";

export function RelatedTools() {
  const { pathname } = useLocation();
  const { toolsList } = useLayout();

  const segments = pathname.toLowerCase().split("/").filter(Boolean);
  const currentTool = toolsList.find((t) => segments.includes(t.slug.toLowerCase()));
  if (!currentTool) return null;

  // Filter out the current active tool, and take 3 related tools to display near top
  const related = toolsList
    .filter((t) => !segments.includes(t.slug.toLowerCase()))
    .slice(0, 3);

  return (
    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 animate-fadein font-sans text-left">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
        <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block"></span>
        Related PDF Tools (No File Upload Required)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map((t) => (
          <Link
            key={t.slug}
            to={`/${t.slug}`}
            className="group flex items-center justify-between p-4 bg-white hover:bg-emerald-50/20 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 border border-slate-205/60 dark:border-slate-800 rounded-2xl transition-all duration-200 hover:border-emerald-500/20 hover:shadow-sm"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="pr-2">
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">
                {t.name}
              </p>
              <p className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                {t.description}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 shrink-0 transform group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
