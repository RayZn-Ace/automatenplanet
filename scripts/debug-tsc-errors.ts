/**
 * Debug helper: runs `tsc` and prints the surrounding source lines
 * for every error reported in a target file.
 *
 * Usage:
 *   bun run scripts/debug-tsc-errors.ts                       # default target
 *   bun run scripts/debug-tsc-errors.ts src/foo/bar.ts        # custom target
 *   bun run scripts/debug-tsc-errors.ts src/foo/bar.ts 5      # 5 lines of context
 */

import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve, relative, sep } from "node:path";

const DEFAULT_TARGET = "src/data/handbuchBoxautomat.ts";
const DEFAULT_CONTEXT = 3;

const args = process.argv.slice(2);
const targetArg = args[0] ?? DEFAULT_TARGET;
const contextLines = Number(args[1] ?? DEFAULT_CONTEXT);

const projectRoot = process.cwd();
const targetAbs = resolve(projectRoot, targetArg);
const targetRel = relative(projectRoot, targetAbs).split(sep).join("/");

if (!existsSync(targetAbs)) {
  console.error(`❌ Target file not found: ${targetAbs}`);
  process.exit(1);
}

// ANSI colors (no deps)
const c = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

console.log(c.cyan(`▶ Running tsc and filtering errors in ${targetRel} …`));

const tsconfig = existsSync(resolve(projectRoot, "tsconfig.app.json"))
  ? "tsconfig.app.json"
  : "tsconfig.json";

const result = spawnSync(
  "bunx",
  ["tsc", "--noEmit", "-p", tsconfig, "--pretty", "false"],
  { encoding: "utf8" },
);

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

// tsc error format:  path/file.ts(LINE,COL): error TSxxxx: message
const errorRegex = /^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s+(.*)$/gm;

type TscError = {
  file: string;
  line: number;
  col: number;
  code: string;
  message: string;
};

const errors: TscError[] = [];
for (const m of output.matchAll(errorRegex)) {
  const file = m[1].split(sep).join("/");
  if (!file.endsWith(targetRel)) continue;
  errors.push({
    file,
    line: Number(m[2]),
    col: Number(m[3]),
    code: m[5],
    message: m[6],
  });
}

if (errors.length === 0) {
  console.log(c.cyan(`✅ No tsc errors in ${targetRel}.`));
  process.exit(0);
}

const source = readFileSync(targetAbs, "utf8").split("\n");
const padWidth = String(source.length).length;

// Group errors by line for compact output
const byLine = new Map<number, TscError[]>();
for (const err of errors) {
  const arr = byLine.get(err.line) ?? [];
  arr.push(err);
  byLine.set(err.line, arr);
}

console.log(
  c.bold(`\nFound ${errors.length} error(s) on ${byLine.size} line(s) in ${targetRel}\n`),
);

const sortedLines = [...byLine.keys()].sort((a, b) => a - b);

for (const lineNo of sortedLines) {
  const errs = byLine.get(lineNo)!;
  console.log(c.bold(c.red(`── ${targetRel}:${lineNo} `.padEnd(80, "─"))));

  for (const err of errs) {
    console.log(`  ${c.yellow(err.code)} (col ${err.col}): ${err.message}`);
  }
  console.log();

  const start = Math.max(1, lineNo - contextLines);
  const end = Math.min(source.length, lineNo + contextLines);

  for (let i = start; i <= end; i++) {
    const isErrLine = i === lineNo;
    const num = String(i).padStart(padWidth, " ");
    const prefix = isErrLine ? c.red("►") : " ";
    const lineText = source[i - 1] ?? "";
    const rendered = `${prefix} ${c.dim(num)} │ ${lineText}`;
    console.log(isErrLine ? c.bold(rendered) : rendered);

    if (isErrLine) {
      // caret(s) under the offending column(s)
      const cols = [...new Set(errs.map((e) => e.col))].sort((a, b) => a - b);
      const maxCol = cols[cols.length - 1];
      const caretLine = Array.from({ length: maxCol }, (_, idx) =>
        cols.includes(idx + 1) ? "^" : " ",
      ).join("");
      console.log(`  ${" ".repeat(padWidth)} │ ${c.red(caretLine)}`);
    }
  }
  console.log();
}

process.exit(1);
