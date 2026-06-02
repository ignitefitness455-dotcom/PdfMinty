import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLayout } from "./Layout";
import Home from "lucide-react/icons/home";
import ChevronRight from "lucide-react/icons/chevron-right";

// 1. Breadcrumbs Component for SEO & Navigation
export function Breadcrumbs() {
  const location = useLocation();
  const { toolsList } = useLayout();

  const currentPath = location.pathname;
  if (currentPath === "/") return null;

  // Match current tool by slug
  const activeTool = toolsList.find((t) => "/" + t.slug === currentPath);
  if (!activeTool) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 select-none animate-fadein"
    >
      <ol className="flex items-center gap-1.5 list-none m-0 p-0">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-150 decoration-none"
            onClick={() => window.scrollTo(0, 0)}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </li>
        <li aria-hidden="true" className="text-slate-300 dark:text-slate-705">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>
        <li className="inline-flex items-center">
          <span aria-current="page" className="text-slate-900 dark:text-slate-100 font-bold">
            {activeTool.name}
          </span>
        </li>
      </ol>
    </nav>
  );
}

// 2. Related Tools Section for Deep Internal Linking (SEO and convenience)
export function RelatedTools() {
  const location = useLocation();
  const { toolsList } = useLayout();

  const currentPath = location.pathname;
  if (currentPath === "/") return null;

  const activeTool = toolsList.find((t) => "/" + t.slug === currentPath);
  if (!activeTool) return null;

  // Deterministically select 3 complementary tools for layout integrity and SEO juice
  const order = [
    "merge",
    "split",
    "compress",
    "rotate",
    "delete-pages",
    "watermark",
    "page-numbers",
    "add-blank",
    "protect",
    "unlock",
    "img-to-pdf",
    "pdf-to-img",
    "ai-analyze",
  ];
  const currentIdx = order.indexOf(activeTool.id);

  const relatedIds: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const nextIdx = (currentIdx + i) % order.length;
    relatedIds.push(order[nextIdx]);
  }

  const relatedTools = toolsList.filter((t) => relatedIds.includes(t.id)).slice(0, 3);

  return (
    <section className="mt-16 pt-10 border-t border-slate-200/60 dark:border-slate-900/80 max-w-4xl mx-auto px-4 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
            Related PDF Utilities
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 font-medium">
            Discover other 100% private, browser-side tools to optimize your workflow.
          </p>
        </div>
        <Link
          to="/"
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          onClick={() => window.scrollTo(0, 0)}
        >
          View all 13 tools &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {relatedTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              to={`/${tool.slug}`}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 hover:border-emerald-500/30 dark:hover:border-emerald-500/40 hover:shadow-[0_8px_20px_rgba(16,185,129,0.04)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:scale-[1.01] transition-all duration-200 group text-left block decoration-none"
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${tool.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                  {tool.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {tool.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
