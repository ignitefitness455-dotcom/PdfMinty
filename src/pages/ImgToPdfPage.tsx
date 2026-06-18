import ToolWorkspace from "../components/ToolWorkspace";
import { SEO } from "../components/SEO";
import { PDFDocument, PageSizes } from "pdf-lib";

export default function ImgToPdfPage() {
  const handleConvert = async (files: File[]): Promise<Blob> => {
    const pdf = await PDFDocument.create();
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      let image;
      if (file.type === "image/png") {
        image = await pdf.embedPng(bytes);
      } else {
        image = await pdf.embedJpg(bytes);
      }
      const page = pdf.addPage(PageSizes.A4);
      const { width, height } = page.getSize();
      const imgDims = image.scaleToFit(width - 40, height - 40);
      page.drawImage(image, {
        x: (width - imgDims.width) / 2,
        y: (height - imgDims.height) / 2,
        width: imgDims.width,
        height: imgDims.height,
      });
    }
    const savedBytes = await pdf.save();
    return new Blob([savedBytes as any], { type: "application/pdf" });
  };

  return (
    <>
      <SEO title="Image to PDF" description="Convert images to PDF" canonical="https://pdfminty.com/image-to-pdf" />
      <ToolWorkspace
        title="Image to PDF"
        description="Convert images to a PDF document. Supports JPG, PNG, WebP."
        onProcess={handleConvert}
        multiple={true}
        acceptedTypes={["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"]}
        downloadFileName="images.pdf"
      />
    </>
  );
}
