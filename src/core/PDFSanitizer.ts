import { UPLOAD_LIMITS } from '../config/constants';

export class PDFSanitizer {
  public static sanitize(
    bytes: Uint8Array,
    options?: { skipEncryptionCheck?: boolean }
  ): { bytes: Uint8Array; warnings: string[] } {
    const warnings: string[] = [];

    if (bytes.byteLength > UPLOAD_LIMITS.MAX_SINGLE_FILE) {
      throw new Error(
        `File exceeds the maximum allowed size of ${UPLOAD_LIMITS.MAX_SINGLE_FILE / (1024 * 1024)}MB.`
      );
    }

    const startStr = new TextDecoder().decode(bytes.slice(0, 50));
    const endStr = new TextDecoder().decode(bytes.slice(-50));

    if (!startStr.includes('%PDF-')) {
      throw new Error('This does not appear to be a valid PDF file. Missing PDF header.');
    }

    if (!endStr.includes('%%EOF')) {
      warnings.push('PDF is missing standard %%EOF marker, file might be truncated or corrupted.');
    }

    const fullText = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

    // Use ignoreCase for more robust detection, though PDF dict keys are case sensitive
    // it's safer.
    if (!options?.skipEncryptionCheck && /\/Encrypt\s+\d+\s+\d+\s+R/.test(fullText)) {
      throw new Error('This PDF appears to be password protected — please use Unlock PDF first.');
    }

    // Strip JS and Launch (Defense in depth) by overwriting them with spaces so byte length doesn't change
    const sanitizedBytes = new Uint8Array(bytes);
    let neutralized = false;

    // We scan for /JS, /JavaScript, /Launch
    const patterns = [/\/JS\b/g, /\/JavaScript\b/g, /\/Launch\b/g];

    for (const pattern of patterns) {
      if (pattern.test(fullText)) {
        neutralized = true;
      }
    }

    if (neutralized) {
      warnings.push('Embedded scripts or launch actions were detected and neutralized.');
      // Find matches in Uint8Array and wipe them with spaces (0x20)
      const keywordBytes = [
        new TextEncoder().encode('/JS'),
        new TextEncoder().encode('/JavaScript'),
        new TextEncoder().encode('/Launch'),
      ];

      for (const kw of keywordBytes) {
        for (let i = 0; i < sanitizedBytes.length - kw.length; i++) {
          let match = true;
          for (let j = 0; j < kw.length; j++) {
            if (sanitizedBytes[i + j] !== kw[j]) {
              match = false;
              break;
            }
          }
          if (match) {
            // Check word boundary so we don't accidentally match something like /JSON
            const nextByte = sanitizedBytes[i + kw.length];
            // Next byte should be a delimiter: space, slash, bracket, angle, etc.
            if (
              [0x20, 0x0a, 0x0d, 0x09, 0x2f, 0x5b, 0x5d, 0x3c, 0x3e, 0x28, 0x29].includes(
                nextByte
              ) ||
              Number.isNaN(nextByte)
            ) {
              for (let j = 0; j < kw.length; j++) {
                sanitizedBytes[i + j] = 0x20; // replace with space
              }
            }
          }
        }
      }
    }

    return { bytes: sanitizedBytes, warnings };
  }
}
