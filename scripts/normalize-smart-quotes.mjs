#!/usr/bin/env node
/**
 * Normalize "smart" / typographic quotes to plain ASCII quotes
 * in all TypeScript files inside src/data/.
 *
 * IMPORTANT: This script is *string-aware*. It walks each file as a
 * tiny lexer so that:
 *   - smart double quotes inside  "..."  strings become \"  (escaped)
 *   - smart single quotes inside  '...'  strings become \'  (escaped)
 *   - inside template literals (`...`) and outside any string, smart
 *     quotes are replaced with their plain ASCII equivalent
 *   - line and block comments are left untouched
 *
 * This avoids the previous bug where “foo” inside a double-quoted
 * string was rewritten to "foo", which prematurely closed the string
 * and produced TS1005 syntax errors.
 *
 * Usage:
 *   node scripts/normalize-smart-quotes.mjs           # rewrite in place
 *   node scripts/normalize-smart-quotes.mjs --check   # exit 1 if changes needed
 */

import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd(), "src/data");
const CHECK_ONLY = process.argv.includes("--check");

// Smart → plain mappings, split by "kind" so we can decide whether to
// emit the plain char or its escaped form depending on the enclosing
// string literal.
const SMART_DOUBLE = new Set([
  "\u201C", // “
  "\u201D", // ”
  "\u201E", // „
  "\u201F", // ‟
  "\u00AB", // «
  "\u00BB", // »
  "\u2033", // ″ (double prime)
]);

const SMART_SINGLE = new Set([
  "\u2018", // ‘
  "\u2019", // ’
  "\u201A", // ‚
  "\u201B", // ‛
  "\u2039", // ‹
  "\u203A", // ›
  "\u2032", // ′ (prime)
]);

function isSmart(ch) {
  return SMART_DOUBLE.has(ch) || SMART_SINGLE.has(ch);
}

/**
 * Walk through `src` and replace smart quotes correctly given the
 * surrounding lexical context. Returns the rewritten string.
 */
function normalize(src) {
  let out = "";
  let i = 0;
  const n = src.length;

  // Lexical state.
  // mode: "code" | "dq" | "sq" | "tpl" | "line-comment" | "block-comment"
  let mode = "code";

  while (i < n) {
    const ch = src[i];
    const next = src[i + 1];

    if (mode === "code") {
      // Enter comments.
      if (ch === "/" && next === "/") {
        out += "//";
        i += 2;
        mode = "line-comment";
        continue;
      }
      if (ch === "/" && next === "*") {
        out += "/*";
        i += 2;
        mode = "block-comment";
        continue;
      }
      // Enter string literals.
      if (ch === '"') {
        out += '"';
        i += 1;
        mode = "dq";
        continue;
      }
      if (ch === "'") {
        out += "'";
        i += 1;
        mode = "sq";
        continue;
      }
      if (ch === "`") {
        out += "`";
        i += 1;
        mode = "tpl";
        continue;
      }
      // In code: replace smart quotes with their plain equivalent.
      if (SMART_DOUBLE.has(ch)) {
        out += '"';
        i += 1;
        continue;
      }
      if (SMART_SINGLE.has(ch)) {
        out += "'";
        i += 1;
        continue;
      }
      out += ch;
      i += 1;
      continue;
    }

    if (mode === "line-comment") {
      out += ch;
      if (ch === "\n") mode = "code";
      i += 1;
      continue;
    }

    if (mode === "block-comment") {
      if (ch === "*" && next === "/") {
        out += "*/";
        i += 2;
        mode = "code";
        continue;
      }
      out += ch;
      i += 1;
      continue;
    }

    // String literal modes share the same escape handling.
    if (mode === "dq" || mode === "sq" || mode === "tpl") {
      // Preserve any escape sequence verbatim.
      if (ch === "\\" && i + 1 < n) {
        out += ch + src[i + 1];
        i += 2;
        continue;
      }

      // Template literal can host ${ ... } expressions in code mode.
      if (mode === "tpl" && ch === "$" && next === "{") {
        // Naive but sufficient: scan until matching '}', tracking
        // nested braces. Inside the expression we are back in "code".
        out += "${";
        i += 2;
        let depth = 1;
        while (i < n && depth > 0) {
          const c = src[i];
          if (c === "{") {
            depth += 1;
            out += c;
            i += 1;
          } else if (c === "}") {
            depth -= 1;
            out += c;
            i += 1;
          } else if (SMART_DOUBLE.has(c)) {
            out += '"';
            i += 1;
          } else if (SMART_SINGLE.has(c)) {
            out += "'";
            i += 1;
          } else {
            out += c;
            i += 1;
          }
        }
        continue;
      }

      // Closing delimiter.
      if (mode === "dq" && ch === '"') {
        out += '"';
        i += 1;
        mode = "code";
        continue;
      }
      if (mode === "sq" && ch === "'") {
        out += "'";
        i += 1;
        mode = "code";
        continue;
      }
      if (mode === "tpl" && ch === "`") {
        out += "`";
        i += 1;
        mode = "code";
        continue;
      }

      // Smart-quote replacement inside a string literal.
      if (isSmart(ch)) {
        const isDouble = SMART_DOUBLE.has(ch);
        const plain = isDouble ? '"' : "'";
        if (mode === "dq" && isDouble) {
          // Would close the string — escape it instead.
          out += '\\"';
        } else if (mode === "sq" && !isDouble) {
          out += "\\'";
        } else {
          // Safe to insert as-is (e.g. ’ inside "..." or “ inside '...').
          out += plain;
        }
        i += 1;
        continue;
      }

      out += ch;
      i += 1;
      continue;
    }
  }

  return out;
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
      yield full;
    }
  }
}

async function main() {
  let exists = true;
  try {
    await stat(ROOT);
  } catch {
    exists = false;
  }
  if (!exists) {
    console.log(`[smart-quotes] Skipping — ${ROOT} does not exist.`);
    return;
  }

  const changed = [];
  for await (const file of walk(ROOT)) {
    const original = await readFile(file, "utf8");
    const normalized = normalize(original);
    if (normalized !== original) {
      changed.push(file);
      if (!CHECK_ONLY) {
        await writeFile(file, normalized, "utf8");
      }
    }
  }

  if (changed.length === 0) {
    console.log("[smart-quotes] OK — no smart quotes found in src/data.");
    return;
  }

  if (CHECK_ONLY) {
    console.error(
      `[smart-quotes] ${changed.length} file(s) contain smart quotes:`,
    );
    for (const f of changed) console.error(`  - ${f}`);
    console.error(
      "Run `node scripts/normalize-smart-quotes.mjs` to fix automatically.",
    );
    process.exit(1);
  }

  console.log(`[smart-quotes] Normalized ${changed.length} file(s):`);
  for (const f of changed) console.log(`  - ${f}`);
}

main().catch((err) => {
  console.error("[smart-quotes] Failed:", err);
  process.exit(1);
});
