import ToolWorkspace from "../components/ToolWorkspace";
import { SEO } from "../components/SEO";
import { PDFJS_WORKER_SRC } from "../config/constants";

export default function PdfToImgPage() {
  const handleConvert = async (files: File[]): Promise<Blob> => {
    // Use pdf.js to render pages to canvas, then export as images
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    
    // Dynamic import pdfjs to avoid SSR issues
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    if (pdf.numPages < 1) {
      throw new Error("The PDF has no pages to convert.");
    }
    const page = await pdf.getPage(1);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not create canvas context.");
    }
    const viewport = page.getViewport({ scale: 2 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport } as any).promise;
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert page to PNG image"));
        }
      }, "image/png");
    });
  };

  return (
    <>
      <SEO title="PDF to Image" description="Convert PDF pages to images" />
      <ToolWorkspace
        title="PDF to Image"
        description="Convert the first page of a PDF to a PNG image."
        onProcess={handleConvert}
        multiple={false}
        downloadFileName="page.png"
      />
    </>
  );
}
