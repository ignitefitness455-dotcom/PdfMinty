import { useState } from "react";
import ToolWorkspace from "@/components/ToolWorkspace";
import { SEO } from "@/components/SEO";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

export default function WatermarkPage() {
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.3);

  const handleWatermark = async (files: File[]): Promise<Blob> => {
    const file = files[0];
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    for (const page of pdf.getPages()) {
      const { width, height } = page.getSize();
      const fontSize = Math.min(width, height) * 0.08;
      page.drawText(watermarkText, {
        x: width / 2 - (font.widthOfTextAtSize(watermarkText, fontSize) / 2),
        y: height / 2,
        size: fontSize,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity,
        rotate: degrees(45),
      });
    }
    const savedBytes = await pdf.save();
    return new Blob([savedBytes as any], { type: "application/pdf" });
  };

  const renderOptions = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="watermark-text-input" className="mb-1 block text-sm font-medium">Watermark Text</label>
        <input
          id="watermark-text-input"
          type="text"
          value={watermarkText}
          onChange={(e) => setWatermarkText(e.target.value)}
          maxLength={50}
          className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
        />
      </div>
      <div>
        <label htmlFor="watermark-opacity-input" className="mb-1 block text-sm font-medium">Opacity: {opacity}</label>
        <input
          id="watermark-opacity-input"
          type="range"
          min={0.1}
          max={1}
          step={0.1}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );

  return (
    <>
      <SEO title="Watermark PDF" description="Add watermarks to PDF pages" canonical="https://pdfminty.com/watermark-pdf" />
      <ToolWorkspace
        title="Watermark PDF"
        description="Add text watermarks to every page of your PDF."
        onProcess={handleWatermark}
        multiple={false}
        renderOptions={renderOptions}
        downloadFileName="watermarked.pdf"
      />
    </>
  );
}
