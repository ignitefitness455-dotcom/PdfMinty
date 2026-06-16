export class PDFSanitizer {
  static sanitize(bytes: Uint8Array): { bytes: Uint8Array; wasSanitized: boolean } {
    let wasSanitized = false;
    let workingBytes = bytes;

    // 1. Shifted Header Repair: Locate the '%PDF-' header and trim any leading garbage bytes/BOM
    const headerPattern = [37, 80, 68, 70, 45]; // '%PDF-' in ASCII code
    let headerOffset = -1;
    for (let i = 0; i < Math.min(workingBytes.length, 1024); i++) {
      if (
        workingBytes[i] === headerPattern[0] &&
        workingBytes[i + 1] === headerPattern[1] &&
        workingBytes[i + 2] === headerPattern[2] &&
        workingBytes[i + 3] === headerPattern[3] &&
        workingBytes[i + 4] === headerPattern[4]
      ) {
        headerOffset = i;
        break;
      }
    }

    if (headerOffset > 0) {
      workingBytes = workingBytes.subarray(headerOffset);
      wasSanitized = true;
    }

    // 2. Trailing Garbage Trim: Trim any trailing garbage bytes after the last '%%EOF'
    // Standard '%%EOF' in ASCII code is [37, 37, 69, 79, 70]
    const eofPattern = [37, 37, 69, 79, 70];
    let lastEofIndex = -1;
    const maxLookback = Math.max(0, workingBytes.length - 8192);
    for (let i = workingBytes.length - 5; i >= maxLookback; i--) {
      if (
        workingBytes[i] === eofPattern[0] &&
        workingBytes[i + 1] === eofPattern[1] &&
        workingBytes[i + 2] === eofPattern[2] &&
        workingBytes[i + 3] === eofPattern[3] &&
        workingBytes[i + 4] === eofPattern[4]
      ) {
        lastEofIndex = i;
        break;
      }
    }

    if (lastEofIndex !== -1 && lastEofIndex + 5 < workingBytes.length) {
      workingBytes = workingBytes.subarray(0, lastEofIndex + 7); // keep standard newline
      wasSanitized = true;
    }

    // 3. Document Action Sanitization: Clean up active scripting entries (/JavaScript nodes)
    let changed = false;
    const len = workingBytes.length;
    for (let i = 0; i < len - 11; i++) {
      if (
        workingBytes[i] === 47 &&      // '/'
        workingBytes[i + 1] === 74 &&  // 'J'
        workingBytes[i + 2] === 97 &&  // 'a'
        workingBytes[i + 3] === 118    // 'v'
      ) {
        const hasJavaScript =
          workingBytes[i + 4] === 97 &&  // 'a'
          workingBytes[i + 5] === 83 &&  // 'S'
          workingBytes[i + 6] === 99 &&  // 'c'
          workingBytes[i + 7] === 114 && // 'r'
          workingBytes[i + 8] === 105 && // 'i'
          workingBytes[i + 9] === 112 && // 'p'
          workingBytes[i + 10] === 116;  // 't'

        if (hasJavaScript) {
          // Obfuscate with inert data keeping exact byte length (/__NoScript_) to not corrupt offsets
          const replacement = "/__NoScript_";
          for (let k = 0; k < replacement.length; k++) {
            workingBytes[i + k] = replacement.charCodeAt(k);
          }
          changed = true;
          i += replacement.length - 1;
        }
      }
    }

    if (changed) {
      wasSanitized = true;
    }

    return { bytes: workingBytes, wasSanitized };
  }
}
