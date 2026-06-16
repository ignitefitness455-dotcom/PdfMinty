import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLayout } from "./Layout";

export const Breadcrumbs: React.FC = () => {
  const { pathname } = useLocation();
  const { toolsList } = useLayout();

  const currentTool = useMemo(() => {
    const segments = pathname.toLowerCase().split("/").filter(Boolean);
    return toolsList.find((t) => segments.includes(t.slug.toLowerCase()));
  }, [toolsList, pathname]);

  return (
    <nav className="flex text-[11px] sm:text-xs text-slate-400/80 mb-6 gap-2 font-bold font-sans tracking-wide">
      <Link to="/" className="hover:text-emerald-600 transition-colors uppercase">Home</Link>
      <span>/</span>
      {currentTool ? (
        <>
          <Link to="/" className="hover:text-emerald-600 transition-colors uppercase">Tools</Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300 uppercase">{currentTool.name}</span>
        </>
      ) : (
        <span className="text-slate-600 dark:text-slate-300 uppercase">Tools Palette</span>
      )}
    </nav>
  );
};

export const RelatedTools: React.FC = () => {
  return null;
};
