import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLayout } from "./Layout";

export const RelatedTools: React.FC = () => {
  const { pathname } = useLocation();
  const { toolsList } = useLayout();

  const related = useMemo(() => {
    const segments = pathname.toLowerCase().split("/").filter(Boolean);
    const activeTool = toolsList.find((t) => segments.includes(t.slug.toLowerCase()));
    const currentIdx = activeTool ? toolsList.indexOf(activeTool) : 0;
    
    return toolsList
      .filter((t) => t.slug !== activeTool?.slug)
      .slice(currentIdx, currentIdx + 3);
  }, [toolsList, pathname]);

  if (pathname === "/") return null;

  return (
    <div className="mt-12 pt-8 border-t border-slate-200" id="related_tools_box">
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-400 mb-4">Other Helper Documents</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map((tool) => (
          <Link
            key={tool.slug}
            to={`/${tool.slug}`}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-all hover:shadow-sm"
          >
            <span className="font-bold text-sm text-slate-800 block hover:text-emerald-700 transition-colors">{tool.name}</span>
            <span className="text-[11px] text-slate-500 block line-clamp-1 mt-1">{tool.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
