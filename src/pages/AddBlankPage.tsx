import { useState } from "react";
import ToolWorkspace from "@/components/ToolWorkspace";
import { SEO } from "@/components/SEO";
import { PDFDocument } from "pdf-lib";

export default function AddBlankPage() {
  const [position, setPosition] = useState("end");

  const handleAddBlank = async (files: File[]): Promise<Blob> => {
    const file = files[0];
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);

    if (position === "start") {
      // Insert at beginning
      const newPdf = await PDFDocument.create();
      newPdf.addPage([612, 792]);
      for (let i = 0; i < pdf.getPageCount(); i++) {
        const [p] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(p);
      }
      const savedBytes = await newPdf.save();
      return new Blob([savedBytes as any], { type: "application/pdf" });
    }
    pdf.addPage([612, 792]);
    const savedBytes = await pdf.save();
    return new Blob([savedBytes as any], { type: "application/pdf" });
  };

  const renderOptions = () => (
    <div>
      <label htmlFor="blank-page-position" className="mb-1 block text-sm font-medium">Position</label>
      <select
        id="blank-page-position"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
      >
        <option value="end">End of document</option>
        <option value="start">Beginning of document</option>
      </select>
    </div>
  );

  return (
    <>
      <SEO title="Add Blank Page" description="Insert blank pages into PDF" />
      <ToolWorkspace
        title="Add Blank Page"
        description="Insert blank pages into your PDF document."
        onProcess={handleAddBlank}
        multiple={false}
        renderOptions={renderOptions}
        downloadFileName="with-blank-page.pdf"
      />
    </>
  );
}
