import ToolWorkspace from "@/components/ToolWorkspace";
import { SEO } from "@/components/SEO";
import { PDFDocument } from "pdf-lib";

export default function CompressPage() {
  const handleCompress = async (files: File[]): Promise<Blob> => {
    const file = files[0];
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    // pdf-lib doesn't have built-in compression — use object stream optimization
    const compressed = await pdf.save({ useObjectStreams: true });
    return new Blob([compressed as any], { type: "application/pdf" });
  };

  return (
    <>
      <SEO title="Compress PDF" description="Reduce PDF file size" />
      <ToolWorkspace
        title="Compress PDF"
        description="Optimize and reduce your PDF file size."
        onProcess={handleCompress}
        multiple={false}
        downloadFileName="compressed.pdf"
      />
    </>
  );
}
