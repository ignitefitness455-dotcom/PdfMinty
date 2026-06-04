/**
 * PDFSanitizer.ts
 *
 * A highly resilient, low-level binary validation and sanitization pipeline for PDFs 
 * compliant with the ISO 32000-1/2 specifications.
 * Evaluates, corrects, and sanitizes incoming Uint8Array binary streams strictly 
 * client-side to prevent parser crashes on corrupted headers, trailing junk, or encrypted payloads.
 */

export interface SanitizationResult {
  /** The sanitized and normalized stream of PDF bytes */
  bytes: Uint8Array;
  /** Whether heuristic restoration of the header was applied */
  headerRecovered: boolean;
  /** Index offset of the actual PDF header */
  headerOffset: number;
  /** Whether the document was processed to terminate cleanly with an EOF marker */
  eofSanitized: boolean;
}

export class PDFSanitizer {
  private static readonly PDF_HEADER_MAGIC = new Uint8Array([37, 80, 68, 70, 45]); // '%PDF-'

  /**
   * Performs deep heuristic checks, scans for headers, cuts leading garbage,
   * validates standard PDF end-of-file structural footprints, and checks for encrypted layers.
   * Crucially, does NOT truncate after the last %%EOF block, preventing silent 
   * corruption of incremental updates or digital signatures.
   */
  public static sanitize(inputBytes: Uint8Array, options?: { skipEncryptionCheck?: boolean }): SanitizationResult {
    console.debug(`[PDFMINTY-DEBUG] PDFSanitizer.sanitize(): starting. Input size=${inputBytes ? inputBytes.length : 0} bytes`);
    if (!inputBytes || inputBytes.length < 5) {
      throw new Error("Invalid PDF stream: Input buffer is empty or structurally too small.");
    }

    let bytes = inputBytes;
    let headerRecovered = false;

    // 1. Viewport & Heuristic Magic Header Scanner
    const headerOffset = this.findHeaderOffset(bytes);
    console.debug(`[PDFMINTY-DEBUG] PDFSanitizer.sanitize(): findHeaderOffset result index=${headerOffset}. Header found=${headerOffset !== -1}`);
    if (headerOffset === -1) {
      throw new Error(
        "Fatal Parser Exception: No compliant PDF header magic ('%PDF-') found within the first 1024 bytes."
      );
    } else if (headerOffset > 0) {
      // Heuristic Recovery: slice leading garbage binary noise safely (zero-copy subarray)
      bytes = bytes.subarray(headerOffset);
      headerRecovered = true;
    }

    // Decode full bytes stream to a search string using 'latin1' encoding
    // this preserves code values exactly 0-255 in JavaScript characters
    const text = new TextDecoder("latin1").decode(bytes);

    // 2. Find the FIRST valid %%EOF (not the last) to check validation footprint
    const firstEofIndex = text.indexOf("%%EOF");
    if (firstEofIndex === -1) {
      throw new Error("Fatal Parser Exception: Invalid PDF: No %%EOF marker found.");
    }

    // 3. Binary-Level Encryption Detector
    // Search the decoded string for occurrences of "/Encrypt" inside trailer dictionary blocks
    let isEncrypted = false;
    const trailerRegex = /trailer\s*<<([\s\S]*?)>>/gi;
    let trailerMatch;
    while ((trailerMatch = trailerRegex.exec(text)) !== null) {
      if (trailerMatch[1].includes("/Encrypt")) {
        isEncrypted = true;
        break;
      }
    }

    // Also check cross-reference streams (PDF 1.5+) trailer dictionary keys for modern files
    if (!isEncrypted) {
      const xrefStreamRegex = /<<[^>]*\/Type\s*\/XRef[^>]*\/Encrypt[^>]*>>/gi;
      if (xrefStreamRegex.test(text)) {
        isEncrypted = true;
      }
    }

    console.debug(`[PDFMINTY-DEBUG] PDFSanitizer.sanitize(): encryption detected=${isEncrypted}`);

    if (isEncrypted && !options?.skipEncryptionCheck) {
      throw new Error(
        "SECURED_LOCKED: The PDF contains a file-level /Encrypt dictionary element. Cannot merge or process without decryption credentials."
      );
    }

    // 4. Do NOT truncate at %%EOF — return the full buffer
    // Only sanitize via pdf-lib's downstream load and re-save pipelines
    console.debug(`[PDFMINTY-DEBUG] PDFSanitizer.sanitize(): complete. Output size=${bytes.length} bytes`);
    return {
      bytes,
      headerRecovered,
      headerOffset,
      eofSanitized: false, // Trailing parts are kept intact to preserve signature updates
    };
  }

  /**
   * Scans the initial 1024 bytes for '%PDF-' signature.
   * Returns index offset or -1 if not found.
   */
  private static findHeaderOffset(bytes: Uint8Array): number {
    const maxScanLimit = Math.min(bytes.length, 1024);
    for (let i = 0; i <= maxScanLimit - this.PDF_HEADER_MAGIC.length; i++) {
      if (
        bytes[i] === this.PDF_HEADER_MAGIC[0] && // '%'
        bytes[i + 1] === this.PDF_HEADER_MAGIC[1] && // 'P'
        bytes[i + 2] === this.PDF_HEADER_MAGIC[2] && // 'D'
        bytes[i + 3] === this.PDF_HEADER_MAGIC[3] && // 'F'
        bytes[i + 4] === this.PDF_HEADER_MAGIC[4]    // '-'
      ) {
        return i;
      }
    }
    return -1;
  }
}
