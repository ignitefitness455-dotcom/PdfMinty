import { PDFDocument as PlainPDFDocument } from 'pdf-lib';
import { describe, it, expect } from 'vitest';

import {
  mergePDFs,
  splitPDF,
  extractPages,
  reorderPDF,
  protectPDF,
  unlockPDF,
} from '../pdf-operations';
import { PDFSanitizer } from '../PDFSanitizer';

// Utility to create a PDF of different page counts with unique page sizes (width = pageIndex * 100)
async function createCustomPdf(pageCount: number): Promise<Uint8Array> {
  const doc = await PlainPDFDocument.create();
  for (let i = 1; i <= pageCount; i++) {
    doc.addPage([i * 100, i * 100]);
  }
  return await doc.save();
}

describe('pdf-operations - Quality Infrastructure Test Suite', () => {
  it('mergePDFs combines page counts and sizes correctly', async () => {
    const pdf1Bytes = await createCustomPdf(2); // page sizes 100 and 200
    const pdf2Bytes = await createCustomPdf(3); // page sizes 100, 200, and 300

    const mergedBytes = await mergePDFs([pdf1Bytes, pdf2Bytes]);
    expect(mergedBytes).toBeInstanceOf(Uint8Array);

    const doc = await PlainPDFDocument.load(mergedBytes);
    expect(doc.getPageCount()).toBe(5);

    // Page dimensions verification
    expect(doc.getPage(0).getSize().width).toBe(100);
    expect(doc.getPage(1).getSize().width).toBe(200);
    expect(doc.getPage(2).getSize().width).toBe(100);
    expect(doc.getPage(3).getSize().width).toBe(200);
    expect(doc.getPage(4).getSize().width).toBe(300);
  });

  it('splitPDF on "1-2,4" produces correct output files and page counts', async () => {
    const pdfBytes = await createCustomPdf(4); // 4 pages

    const results = await splitPDF(pdfBytes, '1-2,4');
    expect(results).toHaveLength(2);

    // First split "1-2"
    const doc1 = await PlainPDFDocument.load(results[0]);
    expect(doc1.getPageCount()).toBe(2);
    expect(doc1.getPage(0).getSize().width).toBe(100);
    expect(doc1.getPage(1).getSize().width).toBe(200);

    // Second split "4"
    const doc2 = await PlainPDFDocument.load(results[1]);
    expect(doc2.getPageCount()).toBe(1);
    expect(doc2.getPage(0).getSize().width).toBe(400);
  });

  it('extractPages yields documents with the expected page subset', async () => {
    const pdfBytes = await createCustomPdf(4);

    // Extract pages 1 and 3 (index 1-based)
    const resultBytes = await extractPages(pdfBytes, [1, 3]);
    expect(resultBytes).toBeInstanceOf(Uint8Array);

    const doc = await PlainPDFDocument.load(resultBytes);
    expect(doc.getPageCount()).toBe(2);
    expect(doc.getPage(0).getSize().width).toBe(100);
    expect(doc.getPage(1).getSize().width).toBe(300);
  });

  it('reorderPDF reshuffles document sequence matching maps cleanly', async () => {
    const pdfBytes = await createCustomPdf(4);

    // Shuffle order of pages: 4, 2, 1, 3 (1-based indices)
    const resultBytes = await reorderPDF(pdfBytes, [4, 2, 1, 3]);
    expect(resultBytes).toBeInstanceOf(Uint8Array);

    const doc = await PlainPDFDocument.load(resultBytes);
    expect(doc.getPageCount()).toBe(4);
    expect(doc.getPage(0).getSize().width).toBe(400);
    expect(doc.getPage(1).getSize().width).toBe(200);
    expect(doc.getPage(2).getSize().width).toBe(100);
    expect(doc.getPage(3).getSize().width).toBe(300);
  });

  it('protectPDF followed by unlockPDF with correct password round-trips correctly', async () => {
    const pdfBytes = await createCustomPdf(2);

    // Encrypt the PDF
    const encryptedBytes = await protectPDF({
      fileBytes: pdfBytes,
      userPassword: 'super_secure_password',
    });
    expect(encryptedBytes).toBeInstanceOf(Uint8Array);

    // Attempting to load encrypted PDF with normal plain loader without password should fail
    // or trigger an encrypted warning checks
    const sanitizeResult = () => PDFSanitizer.sanitize(encryptedBytes);
    expect(sanitizeResult).toThrowError(/password protected/);

    // Decrypt the PDF
    const decryptedBytes = await unlockPDF({
      fileBytes: encryptedBytes,
      password: 'super_secure_password',
    });
    expect(decryptedBytes).toBeInstanceOf(Uint8Array);

    const finalDoc = await PlainPDFDocument.load(decryptedBytes);
    expect(finalDoc.getPageCount()).toBe(2);
    expect(finalDoc.getPage(0).getSize().width).toBe(100);
  });

  it('unlockPDF with INCORRECT password throws a friendly error', async () => {
    const pdfBytes = await createCustomPdf(2);

    // Encrypt
    const encryptedBytes = await protectPDF({ fileBytes: pdfBytes, userPassword: 'safe_key_123' });

    // Decrypt with bad password
    await expect(
      unlockPDF({ fileBytes: encryptedBytes, password: 'wrong_password' })
    ).rejects.toThrowError(/Failed to decrypt document/);
  });

  it('PDFSanitizer.sanitize rejects non-PDF file with a clear error', () => {
    const fakeBytes = new TextEncoder().encode(
      'Hello World this is plain text, not a PDF document!'
    );

    expect(() => PDFSanitizer.sanitize(fakeBytes)).toThrowError(/Missing PDF header/);
  });
});
