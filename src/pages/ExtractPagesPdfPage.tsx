import { useState } from "react";
import ToolWorkspace from "../components/ToolWorkspace";
import { SEO } from "../components/SEO";
import { PDFDocument } from "pdf-lib";

export default function ExtractPagesPdfPage() {
  const [pageRange, setPageRange] = useState("");

  const handleExtract = async (files: File[]): Promise<Blob> => {
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
      // Extract first page of document by default
      const [page] = await newPdf.copyPages(pdf, [0]);
      newPdf.addPage(page);
    }
    const savedBytes = await newPdf.save();
    return new Blob([savedBytes as any], { type: "application/pdf" });
  };

  const renderOptions = () => (
    <div>
      <label htmlFor="extract-range-input" className="mb-1 block text-sm font-medium">Page Range to Extract (e.g., 1-3,5,7-9)</label>
      <input
        id="extract-range-input"
        type="text"
        value={pageRange}
        onChange={(e) => setPageRange(e.target.value)}
        placeholder="Leave empty to extract the first page only"
        className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
      />
    </div>
  );

  return (
    <>
      <SEO title="Extract PDF Pages" description="Extract pages from PDF" />
      <ToolWorkspace
        title="Extract PDF Pages"
        description="Extract specific pages or page ranges from a PDF document."
        onProcess={handleExtract}
        multiple={false}
        renderOptions={renderOptions}
        downloadFileName="extracted.pdf"
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
