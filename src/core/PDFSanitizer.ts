/**
 * PDFSanitizer.ts
 *
 * A highly resilient, low-level binary validation and sanitization pipeline for PDFs 
 * compliant with the ISO 32000-1/2 specifications.
 * Evaluates, corrects, and sanitizes incoming Uint8Array binary streams strictly 
 * client-side to prevent parser crashes on corrupted headers, trailing junk, or encrypted payloads.
 */

// Safe development-only logger — stripped in production by Vite's tree-shaker
const IS_DEV = typeof import.meta !== "undefined" &&
  (import.meta as any).env?.DEV === true;
const debugLog = IS_DEV
  ? (...args: unknown[]) => console.debug(...args)
  : (..._args: unknown[]) => { /* noop in production */ };

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
    // SECURITY FIX: Replaced console.debug with development-only logger to prevent info disclosure in prod consoles
    debugLog(`[PDFMINTY-DEBUG] PDFSanitizer.sanitize(): starting. Input size=${inputBytes ? inputBytes.length : 0} bytes`);
    if (!inputBytes || inputBytes.length < 5) {
      throw new Error("Invalid PDF stream: Input buffer is empty or structurally too small.");
    }

    let bytes = inputBytes;
    let headerRecovered = false;

    // 1. Viewport & Heuristic Magic Header Scanner
    const headerOffset = this.findHeaderOffset(bytes);
    // SECURITY FIX: Replaced console.debug with development-only logger
    debugLog(`[PDFMINTY-DEBUG] PDFSanitizer.sanitize(): findHeaderOffset result index=${headerOffset}. Header found=${headerOffset !== -1}`);
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

    // SECURITY FIX: Replaced console.debug with development-only logger
    debugLog(`[PDFMINTY-DEBUG] PDFSanitizer.sanitize(): encryption detected=${isEncrypted}`);

    if (isEncrypted && !options?.skipEncryptionCheck) {
      throw new Error(
        "SECURED_LOCKED: The PDF contains a file-level /Encrypt dictionary element. Cannot merge or process without decryption credentials."
      );
    }

    // 4. Do NOT truncate at %%EOF — return the full buffer
    // Only sanitize via pdf-lib's downstream load and re-save pipelines
    // SECURITY FIX: Replaced console.debug with development-only logger
    debugLog(`[PDFMINTY-DEBUG] PDFSanitizer.sanitize(): complete. Output size=${bytes.length} bytes`);
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
    if (len === 0) return -1;
    const firstByte = pattern[0];
    const max = bytes.length - len;

    let i = fromIndex;
    while (i <= max) {
      // Find the next occurrence of the first byte of the pattern at native speed
      const nextIndex = bytes.indexOf(firstByte, i);
      if (nextIndex === -1 || nextIndex > max) {
        return -1;
      }

      // Check if subsequent bytes match the pattern
      let isMatch = true;
      for (let j = 1; j < len; j++) {
        if (bytes[nextIndex + j] !== pattern[j]) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        return nextIndex;
      }
      i = nextIndex + 1;
    }
    return -1;
  }

  private static checkEncryptionBinary(bytes: Uint8Array): boolean {
    const len = bytes.length;
    let i = 0;

    const endstreamPattern = new Uint8Array([101, 110, 100, 115, 116, 114, 101, 97, 109]); // 'endstream'

    while (i < len) {
      // Find the next potential stream start ('s') or encrypt key start ('/')
      // of interest using native accelerated single-byte searches.
      const nextSlash = bytes.indexOf(47, i); // '/'
      const nextStreamChar = bytes.indexOf(115, i); // 's'

      // If neither is found, we are done
      if (nextSlash === -1 && nextStreamChar === -1) {
        break;
      }

      const hasSlash = nextSlash !== -1;
      const hasStream = nextStreamChar !== -1;

      if (hasSlash && (!hasStream || nextSlash < nextStreamChar)) {
        // Potential /Encrypt dictionary key appears first
        if (nextSlash + 8 <= len) {
          const isEncrypt = (
            (bytes[nextSlash + 1] === 69 || bytes[nextSlash + 1] === 101) && // 'E' or 'e'
            bytes[nextSlash + 2] === 110 && // 'n'
            bytes[nextSlash + 3] === 99 &&  // 'c'
            bytes[nextSlash + 4] === 114 && // 'r'
            bytes[nextSlash + 5] === 121 && // 'y'
            bytes[nextSlash + 6] === 112 && // 'p'
            bytes[nextSlash + 7] === 116    // 't'
          );

          if (isEncrypt) {
            // Verify if followed by a delimiter to avoid false-positive matches
            const nextByte = nextSlash + 8 < len ? bytes[nextSlash + 8] : 0;
            if (
              nextByte === 32 ||  // space
              nextByte === 10 ||  // LF
              nextByte === 13 ||  // CR
              nextByte === 47 ||  // '/'
              nextByte === 62 ||  // '>'
              nextByte === 60 ||  // '<'
              (nextByte >= 48 && nextByte <= 57) // digit
            ) {
              return true;
            }
          }
        }
        // Advance cursor past the slash to continue looking
        i = nextSlash + 1;
      } else {
        // 'stream' keyword appears first
        if (nextStreamChar + 6 <= len) {
          const isStream = (
            bytes[nextStreamChar + 1] === 116 && // 't'
            bytes[nextStreamChar + 2] === 114 && // 'r'
            bytes[nextStreamChar + 3] === 101 && // 'e'
            bytes[nextStreamChar + 4] === 97 &&  // 'a'
            bytes[nextStreamChar + 5] === 109    // 'm'
          );

          if (isStream) {
            // Find corresponding 'endstream' using optimized sub-array search
            const nextEnd = this.findSequence(bytes, endstreamPattern, nextStreamChar + 6);
            if (nextEnd !== -1) {
              // Safely skip the entire stream payload
              i = nextEnd + 9;
              continue;
            } else {
              // Malformed/truncated stream block; skip the 'stream' keyword itself
              i = nextStreamChar + 6;
              continue;
            }
          }
        }
        // Advance cursor past 's'
        i = nextStreamChar + 1;
      }
    }

    return false;
  }
}
