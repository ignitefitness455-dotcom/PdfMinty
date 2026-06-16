export class PDFSanitizer {
  /**
   * PDFSanitizer strips and obfuscates active/executable structures directly in incoming files:
   * 1. JavaScript actions: Obfuscates both "/JavaScript" and short-form "/JS" keys.
   * 2. Additional Actions (auto-run scripts): Obfuscates "/AA" keys.
   * 3. External Executables & OS Command Launchers: Obfuscates "/Launch" elements.
   * 4. External Data submissions: Obfuscates "/SubmitForm" and "/ImportData" endpoints.
   * 5. Embedded Malware attachments: Obfuscates "/EmbeddedFiles" and "/EmbeddedFile" collections.
   * All replacements perfectly match the original character length to protect internal PDF object offsets.
   */
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

    // PDF Delimiters: Name characters in PDF terminate at standard delimiter characters
    const isDelimiter = (byte: number): boolean => {
      return [
        0x00, 0x09, 0x0a, 0x0c, 0x0d, 0x20, // white space
        40, 41,   // '(', ')'
        60, 62,   // '<', '>'
        91, 93,   // '[', ']'
        123, 125, // '{', '}'
        47, 37    // '/', '%'
      ].includes(byte);
    };

    // 3. Document Action & Active Content Sanitization
    let changed = false;
    const len = workingBytes.length;

    // Define search terms and their replacement arrays. Each mapping has identical character lengths.
    const targets = [
      { term: "/JavaScript", repl: "/__NoScript", limitCheck: false },
      { term: "/JS", repl: "/_JS", limitCheck: true },
      { term: "/AA", repl: "/_AA", limitCheck: true },
      { term: "/Launch", repl: "/_Laun_h", limitCheck: true },
      { term: "/EmbeddedFiles", repl: "/_EmbeddedInrt", limitCheck: false },
      { term: "/EmbeddedFile", repl: "/_EmbeddedInr", limitCheck: false },
      { term: "/SubmitForm", repl: "/_InertForm", limitCheck: false },
      { term: "/ImportData", repl: "/_InertData", limitCheck: false }
    ];

    for (let i = 0; i < len - 3; i++) {
      if (workingBytes[i] === 47) { // '/'
        for (const target of targets) {
          const termLen = target.term.length;
          if (i + termLen > len) continue;

          // Perform exact match verification
          let match = true;
          for (let k = 0; k < termLen; k++) {
            if (workingBytes[i + k] !== target.term.charCodeAt(k)) {
              match = false;
              break;
            }
          }

          if (match) {
            // For brief patterns, apply the delimiter check to prevent middle-of-word corruption
            if (target.limitCheck && i + termLen < len) {
              const nextByte = workingBytes[i + termLen];
              if (!isDelimiter(nextByte)) {
                continue; // Not a logical name token endpoint, skip
              }
            }

            // Perform in-place obfuscation
            for (let k = 0; k < termLen; k++) {
              workingBytes[i + k] = target.repl.charCodeAt(k);
            }
            changed = true;
            i += termLen - 1;
            break;
          }
        }
      }
    }

    if (changed) {
      wasSanitized = true;
    }

    return { bytes: workingBytes, wasSanitized };
  }
}

