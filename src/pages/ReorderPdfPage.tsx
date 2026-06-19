import ToolWorkspace from "../components/ToolWorkspace";
import { SEO } from "../components/SEO";
import { PDFDocument } from "pdf-lib";

export default function ReorderPdfPage() {
  const handleProcess = async (files: File[]): Promise<Blob> => {
    const file = files[0];
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const savedBytes = await pdf.save();
    return new Blob([savedBytes as any], { type: "application/pdf" });
  };

  return (
    <>
      <SEO title="Organize PDF" description="Organize and reorder PDF pages" />
      <ToolWorkspace
        title="Organize PDF"
        description="Organize, reorder, and manage your PDF pages."
        onProcess={handleProcess}
        multiple={false}
        downloadFileName="organized.pdf"
      />
    </>
  );
}
