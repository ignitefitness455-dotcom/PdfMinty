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

    // Read the first 200 bytes for header checking
    const headerBytes = bytes.slice(0, Math.min(200, bytes.length));
    const startStr = new TextDecoder('ascii', { fatal: false }).decode(headerBytes);
    if (!startStr.includes('%PDF-')) {
      throw new Error('This does not appear to be a valid PDF file. Missing PDF header.');
    }

    // Read trailer for standard EOF checks
    const trailerSize = Math.min(200, bytes.length);
    const trailerBytes = bytes.slice(bytes.length - trailerSize);
    const endStr = new TextDecoder('ascii', { fatal: false }).decode(trailerBytes);
    if (!endStr.includes('%%EOF')) {
      warnings.push('PDF is missing standard %%EOF marker, file might be truncated or corrupted.');
    }

    const sanitizedBytes = new Uint8Array(bytes);

    // High performance binary sequences scanning (avoids mammoth UTF-8 string allocations)
    const encryptBytes = new TextEncoder().encode('/Encrypt');
    const jsLongBytes = new TextEncoder().encode('/JavaScript');
    const jsShortBytes = new TextEncoder().encode('/JS');
    const launchBytes = new TextEncoder().encode('/Launch');

    let hasEncryption = false;
    let neutralized = false;

    const matchSequence = (arr: Uint8Array, seq: Uint8Array, index: number): boolean => {
      if (index + seq.length > arr.length) return false;
      for (let j = 0; j < seq.length; j++) {
        if (arr[index + j] !== seq[j]) return false;
      }
      return true;
    };

    const isWordBoundary = (afterByte: number): boolean => {
      return (
        afterByte === undefined ||
        [0x20, 0x0a, 0x0d, 0x09, 0x2f, 0x5b, 0x5d, 0x3c, 0x3e, 0x28, 0x29].includes(afterByte) ||
        Number.isNaN(afterByte)
      );
    };

    // Single-pass scanner over raw buffers
    for (let i = 0; i < sanitizedBytes.length - 3; i++) {
      if (!options?.skipEncryptionCheck && !hasEncryption) {
        if (matchSequence(sanitizedBytes, encryptBytes, i)) {
          const nextByte = sanitizedBytes[i + encryptBytes.length];
          if (isWordBoundary(nextByte)) {
            hasEncryption = true;
          }
        }
      }

      if (matchSequence(sanitizedBytes, jsLongBytes, i)) {
        const nextByte = sanitizedBytes[i + jsLongBytes.length];
        if (isWordBoundary(nextByte)) {
          neutralized = true;
          for (let j = 0; j < jsLongBytes.length; j++) {
            sanitizedBytes[i + j] = 0x20;
          }
          i += jsLongBytes.length - 1;
          continue;
        }
      }

      if (matchSequence(sanitizedBytes, jsShortBytes, i)) {
        const nextByte = sanitizedBytes[i + jsShortBytes.length];
        if (isWordBoundary(nextByte)) {
          neutralized = true;
          for (let j = 0; j < jsShortBytes.length; j++) {
            sanitizedBytes[i + j] = 0x20;
          }
          i += jsShortBytes.length - 1;
          continue;
        }
      }

      if (matchSequence(sanitizedBytes, launchBytes, i)) {
        const nextByte = sanitizedBytes[i + launchBytes.length];
        if (isWordBoundary(nextByte)) {
          neutralized = true;
          for (let j = 0; j < launchBytes.length; j++) {
            sanitizedBytes[i + j] = 0x20;
          }
          i += launchBytes.length - 1;
          continue;
        }
      }
    }

    if (hasEncryption) {
      throw new Error('SECURED_LOCKED: This PDF appears to be password protected — please use Unlock PDF first.');
    }

    if (neutralized) {
      warnings.push('Embedded scripts or launch actions were detected and neutralized.');
    }

    return { bytes: sanitizedBytes, warnings };
  }
}
