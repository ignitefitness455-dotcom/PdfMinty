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

    // 2. Find the FIRST valid %%EOF (not the last) to check validation footprint
    const eofPattern = new Uint8Array([37, 37, 69, 79, 70]); // '%%EOF'
    const firstEofIndex = this.findSequence(bytes, eofPattern);
    if (firstEofIndex === -1) {
      throw new Error("Fatal Parser Exception: Invalid PDF: No %%EOF marker found.");
    }

    // 3. Binary-Level Encryption Detector (O(1) memory, skipping binary stream contents)
    let isEncrypted = false;
    if (!options?.skipEncryptionCheck) {
      isEncrypted = this.checkEncryptionBinary(bytes);
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

  private static findSequence(bytes: Uint8Array, pattern: Uint8Array, fromIndex = 0): number {
    const len = pattern.length;
    const max = bytes.length - len;
    for (let i = fromIndex; i <= max; i++) {
      let isMatch = true;
      for (let j = 0; j < len; j++) {
        if (bytes[i + j] !== pattern[j]) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) return i;
    }
    return -1;
  }

  private static checkEncryptionBinary(bytes: Uint8Array): boolean {
    const endstreamPattern = new Uint8Array([101, 110, 100, 115, 116, 114, 101, 97, 109]); // 'endstream'
    const encryptPattern = new Uint8Array([47, 69, 110, 99, 114, 121, 112, 116]); // '/Encrypt'
    const encryptPattern2 = new Uint8Array([47, 101, 110, 99, 114, 121, 112, 116]); // '/encrypt'

    const len = bytes.length;
    let i = 0;
    while (i < len) {
      // Check if we are entering a stream block
      if (i + 6 <= len && 
          bytes[i] === 115 && bytes[i+1] === 116 && bytes[i+2] === 114 && 
          bytes[i+3] === 101 && bytes[i+4] === 97 && bytes[i+5] === 109) {
        // Find next 'endstream'
        const nextEnd = this.findSequence(bytes, endstreamPattern, i + 6);
        if (nextEnd !== -1) {
          i = nextEnd + 9; // Skip past 'endstream'
          continue;
        }
      }

      // Check for /Encrypt or /encrypt
      if (i + 8 <= len) {
        let matchEncrypt = true;
        let matchEncrypt2 = true;
        for (let j = 0; j < 8; j++) {
          if (bytes[i + j] !== encryptPattern[j]) matchEncrypt = false;
          if (bytes[i + j] !== encryptPattern2[j]) matchEncrypt2 = false;
        }
        if (matchEncrypt || matchEncrypt2) {
          // Verify if followed by a delimiter
          const nextByte = i + 8 < len ? bytes[i + 8] : 0;
          if (nextByte === 32 || nextByte === 10 || nextByte === 13 || nextByte === 47 || nextByte === 62 || nextByte === 60 || (nextByte >= 48 && nextByte <= 57)) {
            return true;
          }
        }
      }

      i++;
    }

    return false;
  }
}
