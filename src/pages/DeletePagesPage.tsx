import { useState } from "react";
import ToolWorkspace from "../components/ToolWorkspace";
import { SEO } from "../components/SEO";
import { PDFDocument } from "pdf-lib";

export default function DeletePagesPage() {
  const [pagesToDelete, setPagesToDelete] = useState("");

  const handleDelete = async (files: File[]): Promise<Blob> => {
    const file = files[0];
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const totalPages = pdf.getPageCount();

    if (!pagesToDelete.trim()) {
      throw new Error("Please specify pages to delete");
    }

    const deleteSet = parsePageRanges(pagesToDelete, totalPages);
    const newPdf = await PDFDocument.create();

    for (let i = 0; i < totalPages; i++) {
      if (!deleteSet.has(i)) {
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);
      }
    }

    if (newPdf.getPageCount() === 0) {
      throw new Error("Cannot delete all pages");
    }

    const savedBytes = await newPdf.save();
    return new Blob([savedBytes as any], { type: "application/pdf" });
  };

  const renderOptions = () => (
    <div>
      <label htmlFor="delete-pages-input" className="mb-1 block text-sm font-medium">Pages to Delete (e.g., 2,4-6)</label>
      <input
        id="delete-pages-input"
        type="text"
        value={pagesToDelete}
        onChange={(e) => setPagesToDelete(e.target.value)}
        placeholder="Enter page numbers to remove"
        className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
      />
    </div>
  );

  return (
    <>
      <SEO title="Delete PDF Pages" description="Remove pages from PDF" canonical="https://pdfminty.com/delete-pages-pdf" />
      <ToolWorkspace
        title="Delete PDF Pages"
        description="Remove specific pages from your PDF document."
        onProcess={handleDelete}
        multiple={false}
        renderOptions={renderOptions}
        downloadFileName="trimmed.pdf"
      />
    </>
  );
}

function parsePageRanges(range: string, maxPages: number): Set<number> {
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
  return pages;
}
