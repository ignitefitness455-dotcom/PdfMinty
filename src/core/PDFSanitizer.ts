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
  private static readonly PDF_EOF_MAGIC = new Uint8Array([37, 37, 69, 79, 70]);     // '%%EOF'

  /**
   * Performs deep heuristic checks, scans for headers, cuts leading garbage,
   * reverses checks for encryption blocks, and strips trailing EOF noise.
   */
  public static sanitize(inputBytes: Uint8Array): SanitizationResult {
    if (!inputBytes || inputBytes.length < 5) {
      throw new Error("Invalid PDF stream: Input buffer is empty or structurally too small.");
    }

    let bytes = inputBytes;
    let headerRecovered = false;
    let eofSanitized = false;

    // 1. Viewport & Heuristic Magic Header Scanner
    const headerOffset = this.findHeaderOffset(bytes);
    if (headerOffset === -1) {
      throw new Error(
        "Fatal Parser Exception: No compliant PDF header magic ('%PDF-') found within the first 1024 bytes."
      );
    } else if (headerOffset > 0) {
      // Heuristic Recovery: slice leading garbage binary noise safely (zero-copy subarray)
      bytes = bytes.subarray(headerOffset);
      headerRecovered = true;
    }

    // 2. Binary-Level Fast Encryption Detector (Reverse-Scanning Trailer)
    if (this.detectEncryptionFast(bytes)) {
      throw new Error(
        "SECURED_LOCKED: The PDF contains a file-level /Encrypt dictionary element. Cannot merge or process without decryption credentials."
      );
    }

    // 3. Strict EOF Sanitization (Trailing garbage / null recovery)
    const lastEofIndex = this.findLastEofIndex(bytes);
    if (lastEofIndex !== -1) {
      const expectedEnd = lastEofIndex + this.PDF_EOF_MAGIC.length;
      if (bytes.length > expectedEnd) {
        // Drop any trailing junk, null padding, or incomplete sequences
        bytes = bytes.subarray(0, expectedEnd);
        eofSanitized = true;
      }
    } else {
      // Missing %%EOF entirely. Force append to avoid parsing cross-reference table corruption at compilation
      const appendEof = new Uint8Array([10, 37, 37, 69, 79, 70, 10]); // '\n%%EOF\n'
      const combined = new Uint8Array(bytes.length + appendEof.length);
      combined.set(bytes, 0);
      combined.set(appendEof, bytes.length);
      bytes = combined;
      eofSanitized = true;
    }

    return {
      bytes,
      headerRecovered,
      headerOffset,
      eofSanitized,
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

  /**
   * Scans the final 2048 bytes of the binary stream for the /Encrypt key.
   * Leverages fast reverse scanning to prevent parsing entire heavy XREF tables.
   */
  private static detectEncryptionFast(bytes: Uint8Array): boolean {
    const scanSize = Math.min(bytes.length, 2048);
    const startPos = bytes.length - scanSize;
    
    // Fast in-memory sequence scan for "/Encrypt" keyword (ASCII)
    // / = 47, E = 69, n = 110, c = 99, r = 114, y = 121, p = 112, t = 116
    const encryptSeq = [47, 69, 110, 99, 114, 121, 112, 116]; 
    
    for (let i = startPos; i <= bytes.length - encryptSeq.length; i++) {
      let matched = true;
      for (let j = 0; j < encryptSeq.length; j++) {
        if (bytes[i + j] !== encryptSeq[j]) {
          matched = false;
          break;
        }
      }
      if (matched) {
        // Double-check bounding characteristics: next byte should not be a letter/number to prevent false-positives
        const boundaryByte = bytes[i + encryptSeq.length];
        if (boundaryByte === undefined || boundaryByte <= 47 || (boundaryByte >= 58 && boundaryByte <= 64) || boundaryByte >= 123) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Backwards search for the last '%%EOF' token starting from end of stream.
   */
  private static findLastEofIndex(bytes: Uint8Array): number {
    const len = bytes.length;
    for (let i = len - this.PDF_EOF_MAGIC.length; i >= 0; i--) {
      if (
        bytes[i] === this.PDF_EOF_MAGIC[0] &&
        bytes[i + 1] === this.PDF_EOF_MAGIC[1] &&
        bytes[i + 2] === this.PDF_EOF_MAGIC[2] &&
        bytes[i + 3] === this.PDF_EOF_MAGIC[3] &&
        bytes[i + 4] === this.PDF_EOF_MAGIC[4]
      ) {
        return i;
      }
    }
    return -1;
  }
}
