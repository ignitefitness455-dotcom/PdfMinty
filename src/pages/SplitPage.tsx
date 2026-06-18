import { useState } from "react";
import ToolWorkspace from "@/components/ToolWorkspace";
import { SEO } from "@/components/SEO";
import { PDFDocument } from "pdf-lib";

export default function SplitPage() {
  const [pageRange, setPageRange] = useState("");

  const handleSplit = async (files: File[]): Promise<Blob> => {
    const file = files[0];
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const newPdf = await PDFDocument.create();

    if (pageRange.trim()) {
      // Parse ranges like "1-3,5,7-9"
      const pagesToExtract = parsePageRanges(pageRange, pdf.getPageCount());
      for (const idx of pagesToExtract) {
        const [page] = await newPdf.copyPages(pdf, [idx]);
        newPdf.addPage(page);
      }
    } else {
      // Split each page into separate doc — return first for now
      const [page] = await newPdf.copyPages(pdf, [0]);
      newPdf.addPage(page);
    }
    const savedBytes = await newPdf.save();
    return new Blob([savedBytes as any], { type: "application/pdf" });
  };

  const renderOptions = () => (
    <div>
      <label htmlFor="page-range-input" className="mb-1 block text-sm font-medium">Page Range (e.g., 1-3,5,7-9)</label>
      <input
        id="page-range-input"
        type="text"
        value={pageRange}
        onChange={(e) => setPageRange(e.target.value)}
        placeholder="Leave empty to extract first page"
        className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
      />
    </div>
  );

  return (
    <>
      <SEO title="Split PDF" description="Extract specific pages from a PDF" canonical="https://pdfminty.com/split-pdf" />
      <ToolWorkspace
        title="Split PDF"
        description="Extract specific pages or ranges from a PDF document."
        onProcess={handleSplit}
        multiple={false}
        renderOptions={renderOptions}
        downloadFileName="split.pdf"
      />
    </>
  );
}

function parsePageRanges(range: string, maxPages: number): number[] {
  const pages = new Set<number>();
  const parts = range.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [start, end] = trimmed.split("-").map(Number);
      for (let i = start - 1; i < end && i < maxPages; i++) {
        if (i >= 0) pages.add(i);
      }
    } else {
      const n = Number(trimmed) - 1;
      if (n >= 0 && n < maxPages) pages.add(n);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}
