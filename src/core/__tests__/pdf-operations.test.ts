import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mergePDFs, splitPDF, deletePagesPDF } from '../pdf-operations';

describe('PDF Operations', () => {
  async function createTestPDF(pageCount: number): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    for (let i = 0; i < pageCount; i++) {
      pdf.addPage([612, 792]);
    }
    return pdf.save();
  }

  it('should merge two PDFs', async () => {
    const pdf1 = await createTestPDF(2);
    const pdf2 = await createTestPDF(3);

    const merged = await mergePDFs({ files: [pdf1, pdf2] });
    const result = await PDFDocument.load(merged);

    expect(result.getPageCount()).toBe(5);
  });

  it('should split PDF by page indices', async () => {
    const pdf = await createTestPDF(5);

    const split = await splitPDF({ fileBytes: pdf, targetPageIndices: [0, 2, 4] });
    const result = await PDFDocument.load(split);

    expect(result.getPageCount()).toBe(3);
  });

  it('should delete pages from PDF', async () => {
    const pdf = await createTestPDF(5);

    const deleted = await deletePagesPDF({ fileBytes: pdf, pagesToDelete: [1, 3] });
    const result = await PDFDocument.load(deleted);

    expect(result.getPageCount()).toBe(3);
  });

  it('should throw when deleting all pages', async () => {
    const pdf = await createTestPDF(3);

    await expect(
      deletePagesPDF({ fileBytes: pdf, pagesToDelete: [0, 1, 2] })
    ).rejects.toThrow('Cannot delete all pages');
  });
});
