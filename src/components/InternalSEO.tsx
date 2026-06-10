import { Link, useLocation } from "react-router-dom";
import { useLayout } from "./Layout";
import Home from "lucide-react/icons/home";
import ChevronRight from "lucide-react/icons/chevron-right";

// 1. Breadcrumbs Component for SEO & Navigation
export function Breadcrumbs() {
  const location = useLocation();
  const { toolsList } = useLayout();

  const rawPath = location.pathname;
  const currentPath = rawPath.endsWith("/") && rawPath !== "/" ? rawPath.slice(0, -1) : rawPath;
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
export { RelatedTools } from "./RelatedTools";
