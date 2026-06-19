import ToolWorkspace from "@/components/ToolWorkspace";
import { SEO } from "@/components/SEO";
import { PDFDocument } from "pdf-lib";

export default function MergePage() {
  const handleMerge = async (files: File[]): Promise<Blob> => {
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }
    const mergedBytes = await mergedPdf.save();
    return new Blob([mergedBytes as any], { type: "application/pdf" });
  };

  return (
    <>
      <SEO title="Merge PDF" description="Combine multiple PDF files into one document" />
      <ToolWorkspace
        title="Merge PDF"
        description="Combine multiple PDF files into a single document. Drag and drop files in your preferred order."
        onProcess={handleMerge}
        multiple={true}
        downloadFileName="merged.pdf"
      />
    </>
  );
}
