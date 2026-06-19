import ToolWorkspace from "@/components/ToolWorkspace";
import { SEO } from "@/components/SEO";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export default function PageNumbersPage() {
  const handleAddPageNumbers = async (files: File[]): Promise<Blob> => {
    const file = files[0];
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    const pages = pdf.getPages();
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width } = page.getSize();
      const pageNum = String(i + 1);
      const fontSize = 12;
      const textWidth = font.widthOfTextAtSize(pageNum, fontSize);
      page.drawText(pageNum, {
        x: width / 2 - textWidth / 2,
        y: 20,
        size: fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
    const savedBytes = await pdf.save();
    return new Blob([savedBytes as any], { type: "application/pdf" });
  };

  return (
    <>
      <SEO title="Add Page Numbers" description="Add page numbers to PDF" />
      <ToolWorkspace
        title="Add Page Numbers"
        description="Add page numbers to the bottom of every page."
        onProcess={handleAddPageNumbers}
        multiple={false}
        downloadFileName="numbered.pdf"
      />
    </>
  );
}
