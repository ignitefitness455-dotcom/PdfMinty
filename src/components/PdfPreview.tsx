import { useEffect, useState } from "react";
import { getPageCount } from "@/core/pdfRunner";

interface PdfPreviewProps {
  file: File;
}

export function PdfPreview({ file }: PdfPreviewProps) {
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => {
    file.arrayBuffer().then((buffer) => {
      getPageCount(buffer).then(setPageCount).catch(console.error);
    });
  }, [file]);

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30">
        <span className="text-xs font-bold">PDF</span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-slate-500">
          {(file.size / 1024 / 1024).toFixed(2)} MB
          {pageCount !== null && ` • ${pageCount} page${pageCount !== 1 ? "s" : ""}`}
        </p>
      </div>
    </div>
  );
}

export default PdfPreview;
