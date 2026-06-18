import { useState } from "react";
import ToolWorkspace from "@/components/ToolWorkspace";
import { SEO } from "@/components/SEO";
import { PDFDocument, degrees } from "pdf-lib";

export default function RotatePage() {
  const [rotation, setRotation] = useState(90);

  const handleRotate = async (files: File[]): Promise<Blob> => {
    const file = files[0];
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    for (const page of pdf.getPages()) {
      page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
    }
    const savedBytes = await pdf.save();
    return new Blob([savedBytes as any], { type: "application/pdf" });
  };

  const renderOptions = () => (
    <div>
      <label htmlFor="rotation-select" className="mb-1 block text-sm font-medium">Rotation</label>
      <select
        id="rotation-select"
        value={rotation}
        onChange={(e) => setRotation(Number(e.target.value))}
        className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800 animate-in fade-in"
      >
        <option value={90}>90° Clockwise</option>
        <option value={180}>180°</option>
        <option value={270}>270° Clockwise (90° Counter)</option>
      </select>
    </div>
  );

  return (
    <>
      <SEO title="Rotate PDF" description="Rotate PDF pages" canonical="https://pdfminty.com/rotate-pdf" />
      <ToolWorkspace
        title="Rotate PDF"
        description="Rotate all pages in your PDF document."
        onProcess={handleRotate}
        multiple={false}
        renderOptions={renderOptions}
        downloadFileName="rotated.pdf"
      />
    </>
  );
}
