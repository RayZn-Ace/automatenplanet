/**
 * Local ESLint plugin: project-rules
 *
 * Custom rules tailored to this repository.
 *
 * Rules:
 *   - no-smart-quotes: forbid typographic ("smart") quotes in TS/TSX
 *     source. Catches the family of characters that previously slipped
 *     into src/data/*.ts files and broke the TypeScript build.
 *
 * The rule operates on the raw source text so it catches smart quotes
 * everywhere — string literals, template literals, JSX text, and even
 * comments — and reports each occurrence with a precise location.
 *
 * Auto-fix: replaces the offending character with its plain ASCII
 * equivalent. For smart double quotes that appear inside a "..."
 * string literal the fixer escapes them as \" so the literal stays
 * syntactically valid; same idea for smart single quotes inside '...'.
 */

// Map of disallowed code points → { name, plain }.
// Keep this list aligned with scripts/normalize-smart-quotes.mjs.
const SMART_DOUBLE = {
  "\u201C": "LEFT DOUBLE QUOTATION MARK", //  “
  "\u201D": "RIGHT DOUBLE QUOTATION MARK", // ”
  "\u201E": "DOUBLE LOW-9 QUOTATION MARK", // „
  "\u201F": "DOUBLE HIGH-REVERSED-9 QUOTATION MARK", // ‟
  "\u00AB": "LEFT-POINTING DOUBLE ANGLE QUOTATION MARK", // «
  "\u00BB": "RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK", // »
  "\u2033": "DOUBLE PRIME", // ″
};

const SMART_SINGLE = {
  "\u2018": "LEFT SINGLE QUOTATION MARK", // ‘
  "\u2019": "RIGHT SINGLE QUOTATION MARK", // ’
  "\u201A": "SINGLE LOW-9 QUOTATION MARK", // ‚
  "\u201B": "SINGLE HIGH-REVERSED-9 QUOTATION MARK", // ‛
  "\u2039": "SINGLE LEFT-POINTING ANGLE QUOTATION MARK", // ‹
  "\u203A": "SINGLE RIGHT-POINTING ANGLE QUOTATION MARK", // ›
  "\u2032": "PRIME", // ′
};

const SMART_CHARS = { ...SMART_DOUBLE, ...SMART_SINGLE };

/**
 * Determine whether `index` in `text` falls inside a "..." or '...'
 * string literal. Tiny scanner — good enough for the auto-fixer to
 * decide whether the replacement needs escaping.
 *
 * Returns one of: 'dq' | 'sq' | 'tpl' | 'code'.
 */
function lexicalContextAt(text, index) {
  let mode = "code"; // code | dq | sq | tpl | line | block
  for (let i = 0; i < index; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (mode === "code") {
      if (ch === "/" && next === "/") {
        mode = "line";
        i++;
        continue;
      }
      if (ch === "/" && next === "*") {
        mode = "block";
        i++;
        continue;
      }
      if (ch === '"') mode = "dq";
      else if (ch === "'") mode = "sq";
      else if (ch === "`") mode = "tpl";
      continue;
    }
    if (mode === "line") {
      if (ch === "\n") mode = "code";
      continue;
    }
    if (mode === "block") {
      if (ch === "*" && next === "/") {
        mode = "code";
        i++;
      }
      continue;
    }
    // Inside string of some kind.
    if (ch === "\\" && i + 1 < text.length) {
      i++; // skip escaped char
      continue;
    }
    if (mode === "dq" && ch === '"') mode = "code";
    else if (mode === "sq" && ch === "'") mode = "code";
    else if (mode === "tpl" && ch === "`") mode = "code";
    // Note: ${...} inside template literals is intentionally NOT
    // tracked here. The auto-fixer falls back to a safe replacement
    // (plain ASCII char) when in 'tpl' or 'code', which works for
    // both the literal text and any nested expressions.
  }
  return mode;
}

const noSmartQuotes = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow typographic / smart quotes in TypeScript source. They frequently break string literals when copy-pasted from prose.",
    },
    fixable: "code",
    schema: [],
    messages: {
      smartQuote:
        "Smart quote detected ({{name}}, U+{{hex}}). Use a plain ASCII quote instead.",
    },
  },

  create(context) {
    return {
      Program() {
        const sourceCode = context.sourceCode ?? context.getSourceCode();
        const text = sourceCode.getText();

        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          const meta = SMART_CHARS[ch];
          if (!meta) continue;

          const loc = sourceCode.getLocFromIndex(i);
          const isDouble = ch in SMART_DOUBLE;
          const ctx = lexicalContextAt(text, i);

          let replacement;
          if (isDouble && ctx === "dq") {
            replacement = '\\"';
          } else if (!isDouble && ctx === "sq") {
            replacement = "\\'";
          } else {
            replacement = isDouble ? '"' : "'";
          }

          context.report({
            loc: { start: loc, end: { line: loc.line, column: loc.column + 1 } },
            messageId: "smartQuote",
            data: {
              name: meta,
              hex: ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0"),
            },
            fix(fixer) {
              return fixer.replaceTextRange([i, i + 1], replacement);
            },
          });
        }
      },
    };
  },
};

export default {
  rules: {
    "no-smart-quotes": noSmartQuotes,
  },
};
