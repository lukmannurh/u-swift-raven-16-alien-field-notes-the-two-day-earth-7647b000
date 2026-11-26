import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Alien Field Notes: The Two Day Earth Review
// One original line: an alien tourist's review of planet Earth.
//
// Gate (sealed scorer): /output/entry.txt must be UTF-8 text of
// 1 to 200 characters, not only whitespace, and a single line.
// This program validates the entry against that gate BEFORE writing
// it, and fails loudly (non-zero exit, message on stderr) if any
// check fails, so a bad entry can never be written silently.
const ENTRY =
  "The guide said humans run on coffee. I watched one drink eight cups and achieve nothing. 5/5, would abduct again.";

// Gate limits, mirrored from the competition rules.
const MIN_CHARS = 1;
const MAX_CHARS = 200;

function fail(message: string): never {
  console.error(`gate check failed: ${message}`);
  process.exit(1);
}

function validateGate(text: string): void {
  // 1. Length: count Unicode code points, not UTF-16 code units, so a
  //    multi-byte character counts as the one character the gate sees.
  const charCount = [...text].length;
  if (charCount < MIN_CHARS || charCount > MAX_CHARS) {
    fail(
      `length ${charCount} characters is outside the gate ` +
        `(${MIN_CHARS}-${MAX_CHARS} characters)`,
    );
  }

  // 2. Single line: no line breaks of any kind (LF, CR, CRLF, or the
  //    Unicode line/paragraph separators).
  if (/[\r\n\u2028\u2029]/.test(text)) {
    fail("entry must be a single line (contains a line break)");
  }

  // 3. Not whitespace-only: at least one non-whitespace character.
  if (text.trim().length === 0) {
    fail("entry must not be only whitespace");
  }

  // 4. UTF-8 round-trip: the bytes the file will hold must decode back
  //    to exactly this text, so no character is silently mangled.
  const bytes = new TextEncoder().encode(text);
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (decoded !== text) {
    fail("UTF-8 round-trip mismatch: decoded text differs from entry");
  }

  // 5. No trailing newline: the written file is exactly the entry text.
  //    (Implicit in checks 2 and 4, but asserted so a future edit that
  //    appends "\n" is caught here rather than at the gate.)
  if (text.endsWith("\n") || text.endsWith("\r")) {
    fail("entry must not end with a newline");
  }
}

validateGate(ENTRY);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");
