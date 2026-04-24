#!/usr/bin/env node
/**
 * Normalize "smart" / typographic quotes to plain ASCII quotes
 * in all TypeScript files inside src/data/.
 *
 * Runs automatically as part of `prebuild` and can also be wired
 * into a local git pre-commit hook (see .husky/pre-commit).
 *
 * Usage:
 *   node scripts/normalize-smart-quotes.mjs           # rewrite files in place
 *   node scripts/normalize-smart-quotes.mjs --check   # exit 1 if changes needed
 */

import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd(), "src/data");
const CHECK_ONLY = process.argv.includes("--check");

// Map of typographic characters → ASCII equivalents.
// Keep this list conservative: only quotes / apostrophes / dashes
// that frequently sneak in from copy-pasted prose.
const REPLACEMENTS = [
  // Double quotes
  ["\u201C", '"'], // “
  ["\u201D", '"'], // ”
  ["\u201E", '"'], // „
  ["\u201F", '"'], // ‟
  ["\u00AB", '"'], // «
  ["\u00BB", '"'], // »
  // Single quotes / apostrophes
  ["\u2018", "'"], // ‘
  ["\u2019", "'"], // ’
  ["\u201A", "'"], // ‚
  ["\u201B", "'"], // ‛
  ["\u2039", "'"], // ‹
  ["\u203A", "'"], // ›
  // Prime marks (occasionally appear instead of quotes)
  ["\u2032", "'"], // ′
  ["\u2033", '"'], // ″
];

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

function normalize(content) {
  let out = content;
  for (const [from, to] of REPLACEMENTS) {
    out = out.split(from).join(to);
  }
  return out;
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
