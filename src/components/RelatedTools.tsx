import { Link, useLocation } from "react-router-dom";
import GitMerge from "lucide-react/icons/git-merge";
import Scissors from "lucide-react/icons/scissors";
import Archive from "lucide-react/icons/archive";
import RotateCw from "lucide-react/icons/rotate-cw";
import Trash2 from "lucide-react/icons/trash-2";
import Stamp from "lucide-react/icons/stamp";
import Hash from "lucide-react/icons/hash";
import FilePlus from "lucide-react/icons/file-plus";
import Lock from "lucide-react/icons/lock";
import Unlock from "lucide-react/icons/unlock";
import Image from "lucide-react/icons/image";
import FileImage from "lucide-react/icons/file-image";
import Sparkles from "lucide-react/icons/sparkles";
import ArrowRight from "lucide-react/icons/arrow-right";

interface ToolInfo {
  name: string;
  desc: string;
  icon: React.ComponentType<any>;
  color: string;
}

const toolMapping: Record<string, ToolInfo> = {
  "/merge-pdf": {
    name: "Merge PDF Files",
    desc: "Combine multiple PDFs into one file",
    icon: GitMerge,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50"
  },
  "/split-pdf": {
    name: "Split PDF Pages",
    desc: "Extract specific pages from any PDF",
    icon: Scissors,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50"
  },
  "/compress-pdf": {
    name: "Compress PDF Size",
    desc: "Reduce PDF file size without quality loss",
    icon: Archive,
    color: "text-violet-500 bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/50"
  },
  "/rotate-pdf": {
    name: "Rotate PDF Pages",
    desc: "Rotate individual or all PDF pages",
    icon: RotateCw,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50"
  },
  "/organize": {
    name: "Delete PDF Pages",
    desc: "Remove unwanted pages from PDF",
    icon: Trash2,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50"
  },
  "/watermark-pdf": {
    name: "Add PDF Watermark",
    desc: "Stamp text watermarks on PDF pages",
    icon: Stamp,
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50"
  },
  "/add-page-numbers": {
    name: "Add Page Numbers to PDF",
    desc: "Number your PDF pages automatically",
    icon: Hash,
    color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 border-cyan-100 dark:border-cyan-900/50"
  },
  "/add-blank-page": {
    name: "Insert Blank PDF Page",
    desc: "Insert blank pages anywhere in PDF",
    icon: FilePlus,
    color: "text-teal-500 bg-teal-50 dark:bg-teal-950/30 border-teal-100 dark:border-teal-900/50"
  },
  "/protect-pdf": {
    name: "Password Protect PDF",
    desc: "Encrypt PDF with a password",
    icon: Lock,
    color: "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50"
  },
  "/unlock-pdf": {
    name: "Remove PDF Password",
    desc: "Remove password from protected PDF",
    icon: Unlock,
    color: "text-green-500 bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/50"
  },
  "/image-to-pdf": {
    name: "Convert Images to PDF",
    desc: "Convert JPG, PNG images to PDF",
    icon: Image,
    color: "text-sky-500 bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/50"
  },
  "/pdf-to-image": {
    name: "Convert PDF to Images",
    desc: "Export PDF pages as image files",
    icon: FileImage,
    color: "text-pink-500 bg-pink-50 dark:bg-pink-950/30 border-pink-100 dark:border-pink-900/50"
  },
  "/intelligence": {
    name: "Analyze PDF with AI",
    desc: "Get AI-powered PDF insights",
    icon: Sparkles,
    color: "text-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950/30 border-fuchsia-100 dark:border-fuchsia-900/50"
  }
};

const relatedMapping: Record<string, string[]> = {
  "/merge-pdf": ["/split-pdf", "/compress-pdf", "/rotate-pdf"],
  "/split-pdf": ["/merge-pdf", "/organize", "/image-to-pdf"],
  "/compress-pdf": ["/merge-pdf", "/pdf-to-image", "/protect-pdf"],
  "/rotate-pdf": ["/merge-pdf", "/split-pdf", "/organize"],
  "/organize": ["/split-pdf", "/merge-pdf", "/add-blank-page"],
  "/watermark-pdf": ["/protect-pdf", "/add-page-numbers", "/merge-pdf"],
  "/add-page-numbers": ["/watermark-pdf", "/merge-pdf", "/split-pdf"],
  "/add-blank-page": ["/merge-pdf", "/rotate-pdf", "/organize"],
  "/protect-pdf": ["/unlock-pdf", "/watermark-pdf", "/merge-pdf"],
  "/unlock-pdf": ["/protect-pdf", "/merge-pdf", "/compress-pdf"],
  "/image-to-pdf": ["/merge-pdf", "/compress-pdf", "/split-pdf"],
  "/pdf-to-image": ["/image-to-pdf", "/merge-pdf", "/compress-pdf"],
  "/intelligence": ["/merge-pdf", "/compress-pdf", "/split-pdf"]
};

export function RelatedTools() {
  const location = useLocation();
  const rawPath = location.pathname;
  let currentPath = rawPath.endsWith("/") && rawPath !== "/" ? rawPath.slice(0, -1) : rawPath;

  // Canonicalize path to handle potential aliases properly
  if (currentPath === "/delete-pages-pdf" || currentPath === "/reorder-pdf") {
    currentPath = "/organize";
  } else if (currentPath === "/extract-pages-pdf") {
    currentPath = "/split-pdf";
  }

  if (currentPath === "/") {
    return null;
  }

  const relatedPaths = relatedMapping[currentPath];

  if (!relatedPaths) {
    return null;
  }

  return (
    <section className="mt-16 pt-10 border-t border-slate-200/60 dark:border-slate-900/80 max-w-4xl mx-auto px-4 select-none">
      <div className="mb-6">
        <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
          You might also need:
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {relatedPaths.map((path) => {
          const tool = toolMapping[path];
          if (!tool) return null;
          const Icon = tool.icon;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 hover:border-emerald-500/30 dark:hover:border-emerald-500/40 hover:shadow-[0_8px_20px_rgba(16,185,129,0.04)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:scale-[1.01] transition-all duration-200 group text-left block decoration-none"
              id={`related-tool-${path.slice(1)}`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${tool.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                      {tool.name}
                    </h3>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transform group-hover:translate-x-1 transition-all duration-200 shrink-0 mt-2.5" />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {tool.desc}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
