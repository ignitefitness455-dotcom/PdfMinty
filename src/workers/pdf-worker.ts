import * as ops from "../core/pdf-operations";

self.onmessage = async (e: MessageEvent) => {
  const { type, id, payload: nestedPayload, ...flatPayload } = e.data;
  const payload = nestedPayload !== undefined ? nestedPayload : flatPayload;

  try {
    let bytes: Uint8Array;
    switch (type) {
      case "merge":
        bytes = await ops.mergePDFs(payload);
        break;
      case "split":
        bytes = await ops.splitPDF(payload);
        break;
      case "split-multi": {
        const results = await ops.splitPDFMulti(payload);
        (self as any).postMessage({ id, success: true, results });
        return;
      }
      case "reorder":
        bytes = await ops.splitPDF(payload);
        break; // reorder uses same extract logic
      case "extract":
        bytes = await ops.splitPDF(payload);
        break;
      case "rotate":
        bytes = await ops.rotatePDF(payload);
        break;
      case "delete-pages":
        bytes = await ops.deletePagesPDF(payload);
        break;
      case "watermark":
        bytes = await ops.watermarkPDF(payload);
        break;
      case "add-page-numbers":
      case "page-numbers":
        bytes = await ops.addPageNumbersPDF(payload);
        break;
      case "add-blank-page":
      case "add-blank":
        bytes = await ops.addBlankPagePDF(payload);
        break;
      case "compress":
        bytes = await ops.compressPDF(payload);
        break;
      case "protect":
        bytes = await ops.protectPDF(payload);
        break;
      case "unlock":
        bytes = await ops.unlockPDF(payload);
        break;
      case "image-to-pdf": {
        const result = await ops.imagesToPDF(payload);
        (self as any).postMessage({ id, success: true, bytes: result.bytes, warnings: result.warnings });
        return;
      }
      case "pdf-to-image": {
        const results = await ops.pdfToImage(payload);
        (self as any).postMessage({ id, success: true, results });
        return;
      }
      default:
        throw new Error(`Unsupported task type: ${type}`);
    }
    (self as any).postMessage({ id, success: true, bytes }, [bytes.buffer]);
  } catch (error: any) {
    (self as any).postMessage({ id, success: false, error: error.message || "Unknown error" });
  }
};

export {};
