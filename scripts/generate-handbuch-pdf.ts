/**
 * Build-time generator: produces public/downloads/handbuch-boxautomat.pdf from
 * the shared content source at src/data/handbuchBoxautomat.ts.
 *
 * Run automatically before each `vite build` via the `prebuild` npm script,
 * so the downloadable PDF is always in sync with the website.
 *
 * Manual run:  bun run scripts/generate-handbuch-pdf.ts
 */

import {
  mkdirSync,
  createWriteStream,
  existsSync,
  copyFileSync,
  statSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

import {
  HANDBUCH_BOXAUTOMAT_FAQ,
  HANDBUCH_BOXAUTOMAT_META,
  HANDBUCH_BOXAUTOMAT_SECTIONS,
  type HandbuchBlock,
  type HandbuchSection,
} from "../src/data/handbuchBoxautomat";
import { HANDBUCH_IMAGE_ASSETS } from "../src/data/handbuchAssets";
import { readFileSync as readFileSyncTop } from "node:fs";

// ---- Paths ------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outDir = resolve(projectRoot, "public/downloads");
const outFile = resolve(outDir, "handbuch-boxautomat.pdf");
const lastGoodFile = resolve(outDir, "handbuch-boxautomat.last-good.pdf");
const tmpFile = resolve(outDir, "handbuch-boxautomat.pdf.tmp");
const manifestFile = resolve(outDir, "handbuch-boxautomat.manifest.json");

// Source-of-truth data file & its mirror inside the edge function folder.
// Every build copies the source into the function so the on-demand PDF stays
// byte-identical to the page content (no manual sync drift possible).
const sourceDataFile = resolve(projectRoot, "src/data/handbuchBoxautomat.ts");
const functionDataFile = resolve(
  projectRoot,
  "supabase/functions/generate-handbuch-pdf/handbuch-data.ts",
);

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// ---- Versioning -------------------------------------------------------------
// Compute a short hash over the source content so we can tell at a glance
// whether the published PDF still matches the website's text.
const contentPayload = JSON.stringify({
  meta: HANDBUCH_BOXAUTOMAT_META,
  sections: HANDBUCH_BOXAUTOMAT_SECTIONS,
  faq: HANDBUCH_BOXAUTOMAT_FAQ,
});
const contentHash = createHash("sha256")
  .update(contentPayload)
  .digest("hex")
  .slice(0, 10);
const generatedAt = new Date().toISOString();

// ---- Sync source data into the edge function folder ------------------------
// Reads src/data/handbuchBoxautomat.ts, strips Node-only references, and
// writes it as the function's `handbuch-data.ts` with a header pin that
// records the expected content hash. The deployed function checks this pin
// on every request and logs a warning if the mirrored data has drifted from
// what the build expected.
try {
  const { readFileSync } = await import("node:fs");
  const sourceContent = readFileSync(sourceDataFile, "utf8");

  // Inline image assets as base64 so the edge function — which has no access
  // to the project's public/ folder at runtime — can still embed them.
  const assetEntries = Object.entries(HANDBUCH_IMAGE_ASSETS).map(([key, asset]) => {
    try {
      const bytes = readFileSync(resolve(projectRoot, asset.filePath));
      const ext = asset.filePath.split(".").pop()?.toLowerCase() ?? "bin";
      const mime =
        ext === "png" ? "image/png" :
        ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
        ext === "webp" ? "image/webp" :
        "application/octet-stream";
      return {
        key,
        mime,
        ext,
        base64: bytes.toString("base64"),
      };
    } catch (err) {
      console.warn(
        `⚠ Could not inline image "${key}" (${asset.filePath}):`,
        (err as Error).message,
      );
      return null;
    }
  }).filter((e): e is { key: string; mime: string; ext: string; base64: string } => e !== null);

  const assetsLiteral =
    `export const HANDBUCH_IMAGE_ASSETS_BASE64: Record<string, { mime: string; ext: string; base64: string }> = {\n` +
    assetEntries
      .map(
        (e) =>
          `  ${JSON.stringify(e.key)}: { mime: ${JSON.stringify(e.mime)}, ext: ${JSON.stringify(e.ext)}, base64: ${JSON.stringify(e.base64)} },\n`,
      )
      .join("") +
    `};\n\n`;

  const banner =
    `// ---------------------------------------------------------------------------\n` +
    `// AUTO-GENERATED — DO NOT EDIT BY HAND.\n` +
    `// Synced from src/data/handbuchBoxautomat.ts by\n` +
    `// scripts/generate-handbuch-pdf.ts on every build.\n` +
    `//\n` +
    `// Expected content hash: ${contentHash}\n` +
    `// Synced at:             ${generatedAt}\n` +
    `// Inlined image assets:  ${assetEntries.length}\n` +
    `// ---------------------------------------------------------------------------\n\n` +
    `export const EXPECTED_CONTENT_HASH = ${JSON.stringify(contentHash)};\n` +
    `export const SYNCED_AT = ${JSON.stringify(generatedAt)};\n\n` +
    assetsLiteral;
  writeFileSync(functionDataFile, banner + sourceContent);
  console.log(
    `✓ Synced handbook data → ${functionDataFile} (hash ${contentHash}, ${assetEntries.length} image assets)`,
  );
} catch (err) {
  console.warn(
    "⚠ Could not sync handbook data into edge function folder:",
    (err as Error).message,
  );
}


// ---- Fallback handling ------------------------------------------------------
// 1. Snapshot the current good PDF before regenerating, so we always keep the
//    last successful version available for download.
// 2. Render into a temporary file. On success, atomically rename it to the
//    real output path. On any error, leave the previous PDF untouched and
//    report the failure (the website's download button will fall back to
//    the .last-good.pdf copy automatically).

const snapshotLastGood = () => {
  try {
    if (existsSync(outFile) && statSync(outFile).size > 0) {
      copyFileSync(outFile, lastGoodFile);
    }
  } catch (err) {
    console.warn("⚠ Could not snapshot last-good PDF:", (err as Error).message);
  }
};

const restoreFromLastGood = (reason: string) => {
  console.error(`✗ PDF generation failed: ${reason}`);
  try {
    if (existsSync(tmpFile)) unlinkSync(tmpFile);
  } catch {
    /* ignore */
  }
  if (existsSync(lastGoodFile)) {
    try {
      copyFileSync(lastGoodFile, outFile);
      console.warn(
        `↩ Restored last-good PDF (${lastGoodFile}) to ${outFile}. ` +
          "Website will continue serving the previous version.",
      );
    } catch (err) {
      console.error("✗ Failed to restore last-good PDF:", (err as Error).message);
    }
  } else {
    console.error(
      "✗ No last-good PDF available to fall back to. The download will 404 until the next successful build.",
    );
  }
  process.exit(1);
};

snapshotLastGood();

process.on("uncaughtException", (err) => restoreFromLastGood(err.message));
process.on("unhandledRejection", (reason) =>
  restoreFromLastGood(reason instanceof Error ? reason.message : String(reason)),
);


// ---- Theme ------------------------------------------------------------------
const COLORS = {
  text: "#1a1a1a",
  muted: "#555555",
  primary: "#2563eb",
  warning: "#b91c1c",
  rule: "#cccccc",
  calloutBg: "#f1f5fb",
  warningBg: "#fdecec",
  tableHeader: "#f5f5f5",
};

const FONT_REGULAR = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";
const FONT_ITALIC = "Helvetica-Oblique";
const BODY_SIZE = 10.5;

// pdfkit's built-in fonts use WinAnsi — strip emoji/non-WinAnsi glyphs.
const sanitize = (s: string): string =>
  s
    .replace(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\u{2300}-\u{23FF}]/gu,
      "",
    )
    .replace(/[\u200D\uFE0F]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// ---- Document setup ---------------------------------------------------------
const MARGIN = { top: 60, bottom: 75, left: 60, right: 60 };
const doc = new PDFDocument({
  size: "A4",
  margins: MARGIN,
  bufferPages: true,
  autoFirstPage: true,
  info: {
    Title: HANDBUCH_BOXAUTOMAT_META.title,
    Author: HANDBUCH_BOXAUTOMAT_META.publisher.name,
    Subject: "Benutzerhandbuch Boxautomat",
    Keywords:
      "Boxautomat, Box Maschine, Kick Maschine, Handbuch, Wartung, Fehlerbehebung",
    Producer: "AutomatPlanet PDF Generator",
  },
});

const stream = createWriteStream(tmpFile);
stream.on("error", (err) => restoreFromLastGood(`write stream: ${err.message}`));
doc.on("error", (err) => restoreFromLastGood(`pdfkit: ${err.message}`));
doc.pipe(stream);

const PAGE_W = doc.page.width;
const PAGE_H = doc.page.height;
const CONTENT_W = PAGE_W - MARGIN.left - MARGIN.right;
const CONTENT_BOTTOM = PAGE_H - MARGIN.bottom;

// Reset text style helper – call before every block to neutralise leftover state.
const resetStyle = () => {
  doc.font(FONT_REGULAR).fontSize(BODY_SIZE).fillColor(COLORS.text);
};

// Default text options injected into every text() call to neutralise sticky
// state (characterSpacing/wordSpacing leak across calls in pdfkit).
const TXT = { characterSpacing: 0, wordSpacing: 0 } as const;

// Add a manual page when remaining vertical space is too small.
const ensureSpace = (needed: number) => {
  if (doc.y + needed > CONTENT_BOTTOM) {
    doc.addPage();
    doc.x = MARGIN.left;
    doc.y = MARGIN.top;
  }
};

// ---- Block writers ----------------------------------------------------------
const writeParagraph = (
  text: string,
  opts: { font?: string; size?: number; color?: string; gapAfter?: number } = {},
) => {
  const { font = FONT_REGULAR, size = BODY_SIZE, color = COLORS.text, gapAfter = 6 } = opts;
  resetStyle();
  doc.font(font).fontSize(size).fillColor(color);
  const txt = sanitize(text);
  const h = doc.heightOfString(txt, { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W });
  ensureSpace(h);
  doc.text(txt, MARGIN.left, doc.y, { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W, align: "left" });
  doc.y += gapAfter;
};

const writeBullet = (item: string, ordered: boolean, index: number) => {
  resetStyle();
  const marker = ordered ? `${index + 1}.` : "•";
  const markerW = ordered ? 18 : 14;
  const xMarker = MARGIN.left + 6;
  const xText = xMarker + markerW;
  const wText = CONTENT_W - markerW - 6;
  doc.font(FONT_REGULAR).fontSize(BODY_SIZE).fillColor(COLORS.text);
  const txt = sanitize(item);
  const h = doc.heightOfString(txt, { characterSpacing: 0, wordSpacing: 0, width: wText });
  ensureSpace(h + 2);
  const startY = doc.y;
  doc.text(marker, xMarker, startY, { characterSpacing: 0, wordSpacing: 0, width: markerW, lineBreak: false });
  doc.text(txt, xText, startY, { characterSpacing: 0, wordSpacing: 0, width: wText });
  doc.y = Math.max(doc.y, startY + h);
  doc.y += 2;
};

const writeSubheading = (text: string) => {
  resetStyle();
  ensureSpace(28);
  doc.y += 6;
  doc
    .font(FONT_BOLD)
    .fontSize(12)
    .fillColor(COLORS.text)
    .text(sanitize(text), MARGIN.left, doc.y, { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W });
  doc.y += 4;
};

const writeCallout = (
  variant: "info" | "warning",
  lines: string[],
  title?: string,
) => {
  resetStyle();
  const isWarning = variant === "warning";
  const bg = isWarning ? COLORS.warningBg : COLORS.calloutBg;
  const accent = isWarning ? COLORS.warning : COLORS.primary;

  const padding = 10;
  const accentW = 4;
  const innerX = MARGIN.left + accentW + padding;
  const innerW = CONTENT_W - accentW - padding * 2;

  // Pre-measure total height
  doc.font(FONT_REGULAR).fontSize(BODY_SIZE);
  let totalTextH = 0;
  if (title) {
    doc.font(FONT_BOLD);
    totalTextH += doc.heightOfString(sanitize(title), { characterSpacing: 0, wordSpacing: 0, width: innerW }) + 4;
    doc.font(FONT_REGULAR);
  }
  for (const line of lines) {
    const txt = lines.length === 1 && !title ? sanitize(line) : `• ${sanitize(line)}`;
    totalTextH += doc.heightOfString(txt, { characterSpacing: 0, wordSpacing: 0, width: innerW }) + 2;
  }
  const boxH = totalTextH + padding * 2;
  ensureSpace(boxH + 8);

  const x = MARGIN.left;
  const y = doc.y;
  // Background + accent bar
  doc.save().rect(x, y, CONTENT_W, boxH).fill(bg).restore();
  doc.save().rect(x, y, accentW, boxH).fill(accent).restore();

  let cy = y + padding;
  if (title) {
    doc
      .font(FONT_BOLD)
      .fontSize(BODY_SIZE)
      .fillColor(COLORS.text)
      .text(sanitize(title), innerX, cy, { characterSpacing: 0, wordSpacing: 0, width: innerW });
    cy = doc.y + 2;
  }
  doc.font(FONT_REGULAR).fontSize(BODY_SIZE).fillColor(COLORS.text);
  for (const line of lines) {
    const txt = lines.length === 1 && !title ? sanitize(line) : `• ${sanitize(line)}`;
    doc.text(txt, innerX, cy, { characterSpacing: 0, wordSpacing: 0, width: innerW });
    cy = doc.y + 2;
  }
  doc.y = y + boxH + 8;
};

const writeTable = (rows: { label: string; value: string }[]) => {
  resetStyle();
  const labelW = CONTENT_W * 0.4;
  const valueW = CONTENT_W - labelW;
  const padding = 8;

  for (const row of rows) {
    doc.font(FONT_BOLD).fontSize(BODY_SIZE);
    const lh = doc.heightOfString(sanitize(row.label), { characterSpacing: 0, wordSpacing: 0, width: labelW - padding * 2 });
    doc.font(FONT_REGULAR);
    const vh = doc.heightOfString(sanitize(row.value), { characterSpacing: 0, wordSpacing: 0, width: valueW - padding * 2 });
    const rowH = Math.max(lh, vh) + padding * 2;
    ensureSpace(rowH);

    const x = MARGIN.left;
    const y = doc.y;
    // Borders + header background
    doc.save().rect(x, y, labelW, rowH).fill(COLORS.tableHeader).restore();
    doc
      .save()
      .lineWidth(0.5)
      .strokeColor(COLORS.rule)
      .rect(x, y, CONTENT_W, rowH)
      .stroke()
      .moveTo(x + labelW, y)
      .lineTo(x + labelW, y + rowH)
      .stroke()
      .restore();

    doc
      .font(FONT_BOLD)
      .fontSize(BODY_SIZE)
      .fillColor(COLORS.text)
      .text(sanitize(row.label), x + padding, y + padding, { characterSpacing: 0, wordSpacing: 0, width: labelW - padding * 2,
      });
    doc
      .font(FONT_REGULAR)
      .text(sanitize(row.value), x + labelW + padding, y + padding, { characterSpacing: 0, wordSpacing: 0, width: valueW - padding * 2,
      });

    doc.y = y + rowH;
  }
  doc.y += 6;
};

const writeImage = (
  assetKey: string,
  alt: string,
  caption: string | undefined,
  maxWidthPct: number,
) => {
  const asset = HANDBUCH_IMAGE_ASSETS[assetKey];
  if (!asset) {
    console.warn(`⚠ Unknown image assetKey "${assetKey}" – skipping in PDF.`);
    return;
  }
  let bytes: Buffer;
  try {
    bytes = readFileSyncTop(resolve(projectRoot, asset.filePath));
  } catch (err) {
    console.warn(
      `⚠ Could not read image asset "${assetKey}" at ${asset.filePath}:`,
      (err as Error).message,
    );
    return;
  }

  const pct = Math.min(100, Math.max(10, maxWidthPct || 100));
  const targetW = (CONTENT_W * pct) / 100;
  // Reserve room for caption (≈ 14pt) + spacing.
  const captionH = caption ? 16 : 0;
  // Estimate height upfront isn't trivial without decoding; pdfkit will scale
  // by width and we ensure space for at least the width + caption padding.
  // Use a reasonable max so we don't push past page bottom.
  const remaining = CONTENT_BOTTOM - doc.y;
  if (remaining < 120) {
    doc.addPage();
    doc.x = MARGIN.left;
    doc.y = MARGIN.top;
  }
  const availH = CONTENT_BOTTOM - doc.y - captionH - 8;
  doc.image(bytes, MARGIN.left, doc.y, {
    fit: [targetW, availH],
    align: "left",
  });
  // Move y past the rendered image. pdfkit doesn't update doc.y after image(),
  // so we advance using the actual fitted box height.
  // To keep it simple and safe, reserve the full availH the image was allowed
  // to occupy when it's tall, otherwise compute via image dimensions.
  // pdfkit exposes openImage to query natural size:
  // deno-lint-ignore no-explicit-any
  const img: any = (doc as unknown as { openImage: (b: Buffer) => { width: number; height: number } }).openImage(bytes);
  const scale = Math.min(targetW / img.width, availH / img.height);
  const renderedH = img.height * scale;
  doc.y += renderedH + 6;

  if (caption) {
    doc
      .font(FONT_ITALIC)
      .fontSize(BODY_SIZE - 1)
      .fillColor(COLORS.muted)
      .text(sanitize(caption), MARGIN.left, doc.y, { ...TXT, width: CONTENT_W });
    resetStyle();
    doc.y += 6;
  }
  // Alt text isn't rendered visually but kept here as documentation; future
  // enhancement could embed it as PDF accessibility metadata.
  void alt;
};

const writeBlock = (block: HandbuchBlock) => {
  switch (block.type) {
    case "paragraph":
      writeParagraph(block.text, { font: block.emphasis ? FONT_BOLD : FONT_REGULAR });
      return;
    case "subheading":
      writeSubheading(block.text);
      return;
    case "list":
      block.items.forEach((item, idx) => writeBullet(item, !!block.ordered, idx));
      doc.y += 4;
      return;
    case "callout":
      writeCallout(block.variant, block.lines, block.title);
      return;
    case "table":
      writeTable(block.rows);
      return;
    case "image":
      writeImage(block.assetKey, block.alt, block.caption, block.maxWidthPct ?? 100);
      return;
  }
};

// Records the page index (0-based) where each section heading lives so the
// TOC entries can be patched with real page numbers in a second pass.
const headingPageByAnchor: Record<string, number> = {};

const writeSectionHeading = (number: string, title: string, anchor?: string) => {
  resetStyle();
  ensureSpace(48);
  if (anchor) {
    // Register a named destination at the current y on the current page so
    // TOC links can jump here.
    try { (doc as unknown as { addNamedDestination: (n: string) => void }).addNamedDestination(anchor); } catch { /* older pdfkit */ }
    const range = doc.bufferedPageRange();
    headingPageByAnchor[anchor] = range.start + range.count - 1;
  }
  doc
    .font(FONT_BOLD)
    .fontSize(18)
    .fillColor(COLORS.primary)
    .text(`${number}. ${sanitize(title)}`, MARGIN.left, doc.y, { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W });
  const lineY = doc.y + 2;
  doc
    .save()
    .lineWidth(1.5)
    .strokeColor(COLORS.primary)
    .moveTo(MARGIN.left, lineY)
    .lineTo(MARGIN.left + 50, lineY)
    .stroke()
    .restore();
  doc.y = lineY + 14;
};

const writeSection = (section: HandbuchSection) => {
  writeSectionHeading(section.number, section.title, `sec-${section.id}`);
  for (const block of section.blocks) writeBlock(block);
};

// ---- Cover page -------------------------------------------------------------
resetStyle();
doc
  .font(FONT_BOLD)
  .fontSize(11)
  .fillColor(COLORS.primary)
  .text(HANDBUCH_BOXAUTOMAT_META.subtitle.toUpperCase(), MARGIN.left, doc.y, { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W,
  });
doc.y += 4;

doc
  .font(FONT_BOLD)
  .fontSize(26)
  .fillColor(COLORS.text)
  .text(sanitize(HANDBUCH_BOXAUTOMAT_META.product), MARGIN.left, doc.y, { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W,
  });
doc.y += 4;

doc
  .font(FONT_ITALIC)
  .fontSize(11)
  .fillColor(COLORS.muted)
  .text(
    `Artikelnummer ${HANDBUCH_BOXAUTOMAT_META.articleNumber} - Stand ${HANDBUCH_BOXAUTOMAT_META.lastUpdated}`,
    MARGIN.left,
    doc.y,
    { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W },
  );
doc.y += 18;

resetStyle();
doc
  .text(HANDBUCH_BOXAUTOMAT_META.publisher.name, MARGIN.left, doc.y, { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W })
  .text(HANDBUCH_BOXAUTOMAT_META.publisher.address, { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W })
  .text(
    `${HANDBUCH_BOXAUTOMAT_META.publisher.email} - ${HANDBUCH_BOXAUTOMAT_META.publisher.website}`,
    { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W },
  );
doc.y += 16;

doc
  .save()
  .lineWidth(0.5)
  .strokeColor(COLORS.rule)
  .moveTo(MARGIN.left, doc.y)
  .lineTo(PAGE_W - MARGIN.right, doc.y)
  .stroke()
  .restore();
doc.y += 12;

// Table of contents (still on the cover page) — clickable, with page numbers
// patched in after section rendering completes.
doc
  .font(FONT_BOLD)
  .fontSize(14)
  .fillColor(COLORS.text)
  .text("Inhaltsverzeichnis", MARGIN.left, doc.y, { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W });
doc.y += 8;

type TocEntry = {
  number: string;
  title: string;
  anchor: string;
  y: number;
  pageIdx: number;
};
const tocEntries: TocEntry[] = [];

const tocLineHeight = 14;
const tocLeftIndent = 12;
const tocPageColW = 32;
const tocLabelX = MARGIN.left + tocLeftIndent;
const tocLabelW = CONTENT_W - tocLeftIndent - tocPageColW - 4;
const tocPageColX = MARGIN.left + CONTENT_W - tocPageColW;

const drawTocEntry = (number: string, title: string, anchor: string) => {
  doc.font(FONT_REGULAR).fontSize(BODY_SIZE).fillColor(COLORS.primary);
  const text = `${number}. ${sanitize(title)}`;
  const yStart = doc.y;
  doc.text(text, tocLabelX, yStart, {
    characterSpacing: 0,
    wordSpacing: 0,
    width: tocLabelW,
    lineBreak: false,
    ellipsis: true,
  });
  // Clickable link annotation covering the whole row.
  try {
    (doc as unknown as {
      link: (
        x: number, y: number, w: number, h: number,
        opts: { goTo: string },
      ) => void;
    }).link(MARGIN.left, yStart - 2, CONTENT_W, tocLineHeight, { goTo: anchor });
  } catch {
    try {
      // deno-lint-ignore no-explicit-any
      (doc as any).link(MARGIN.left, yStart - 2, CONTENT_W, tocLineHeight, anchor);
    } catch { /* ignore */ }
  }
  const pageRange = doc.bufferedPageRange();
  tocEntries.push({
    number, title, anchor, y: yStart,
    pageIdx: pageRange.start + pageRange.count - 1,
  });
  doc.y = yStart + tocLineHeight;
  resetStyle();
};

HANDBUCH_BOXAUTOMAT_SECTIONS.forEach((section) => {
  drawTocEntry(section.number, section.title, `sec-${section.id}`);
});
drawTocEntry(
  String(HANDBUCH_BOXAUTOMAT_SECTIONS.length + 1),
  "Häufig gestellte Fragen",
  "sec-faq",
);
drawTocEntry(
  String(HANDBUCH_BOXAUTOMAT_SECTIONS.length + 2),
  "Support & Kontakt",
  "sec-support",
);

// ---- Sections ---------------------------------------------------------------
HANDBUCH_BOXAUTOMAT_SECTIONS.forEach((section, idx) => {
  // Add a small visual separator between sections without forcing a new page.
  if (idx > 0) {
    ensureSpace(28);
    doc.y += 12;
  } else {
    doc.y += 14;
  }
  writeSection(section);
});

// ---- FAQ --------------------------------------------------------------------
ensureSpace(60);
doc.y += 12;
writeSectionHeading(
  String(HANDBUCH_BOXAUTOMAT_SECTIONS.length + 1),
  "Häufig gestellte Fragen",
  "sec-faq",
);
HANDBUCH_BOXAUTOMAT_FAQ.forEach((item) => {
  resetStyle();
  ensureSpace(40);
  doc
    .font(FONT_BOLD)
    .fontSize(11.5)
    .fillColor(COLORS.text)
    .text(sanitize(item.question), MARGIN.left, doc.y, { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W });
  doc.y += 2;
  doc
    .font(FONT_REGULAR)
    .fontSize(BODY_SIZE)
    .fillColor(COLORS.text)
    .text(sanitize(item.answer), MARGIN.left, doc.y, { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W });
  doc.y += 8;
});

// ---- Support ----------------------------------------------------------------
ensureSpace(60);
doc.y += 12;
writeSectionHeading(
  String(HANDBUCH_BOXAUTOMAT_SECTIONS.length + 2),
  "Support & Kontakt",
);
resetStyle();
doc.text("Bei Fragen oder Problemen wenden Sie sich bitte an:", MARGIN.left, doc.y, { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W,
});
doc.y += 6;
doc.font(FONT_BOLD).text(HANDBUCH_BOXAUTOMAT_META.publisher.name);
doc.font(FONT_REGULAR).text(HANDBUCH_BOXAUTOMAT_META.publisher.address);
doc.text(`E-Mail: ${HANDBUCH_BOXAUTOMAT_META.publisher.email}`);
doc.text(`Web:    ${HANDBUCH_BOXAUTOMAT_META.publisher.website}`);

// ---- Footer on every page ---------------------------------------------------
const range = doc.bufferedPageRange();
const totalPages = range.count;
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  const pageNum = i - range.start + 1;
  const footerY = PAGE_H - MARGIN.bottom + 25;

  doc
    .save()
    .lineWidth(0.5)
    .strokeColor(COLORS.rule)
    .moveTo(MARGIN.left, footerY - 8)
    .lineTo(PAGE_W - MARGIN.right, footerY - 8)
    .stroke()
    .restore();

  doc.font(FONT_REGULAR).fontSize(8).fillColor(COLORS.muted);

  // Left-aligned company line (single line).
  doc.text(
    `${HANDBUCH_BOXAUTOMAT_META.publisher.name} - ${HANDBUCH_BOXAUTOMAT_META.publisher.website}`,
    MARGIN.left,
    footerY,
    { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W / 2, align: "left", lineBreak: false },
  );
  // Center: version + date
  doc.text(
    `Stand ${HANDBUCH_BOXAUTOMAT_META.lastUpdated} - v${HANDBUCH_BOXAUTOMAT_META.version} - ${contentHash}`,
    MARGIN.left,
    footerY,
    { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W, align: "center", lineBreak: false },
  );
  // Right: page number
  doc.text(`Seite ${pageNum} / ${totalPages}`, MARGIN.left, footerY, { characterSpacing: 0, wordSpacing: 0, width: CONTENT_W,
    align: "right",
    lineBreak: false,
  });
}

doc.end();

stream.on("finish", () => {
  try {
    const size = statSync(tmpFile).size;
    if (size === 0) {
      restoreFromLastGood("generated PDF is empty (0 bytes)");
      return;
    }
    renameSync(tmpFile, outFile);

    const manifest = {
      version: HANDBUCH_BOXAUTOMAT_META.version,
      contentHash,
      generatedAt,
      lastUpdated: HANDBUCH_BOXAUTOMAT_META.lastUpdated,
      sizeBytes: size,
      sourceSections: HANDBUCH_BOXAUTOMAT_SECTIONS.length,
      pdfPath: HANDBUCH_BOXAUTOMAT_META.pdfPath,
    };
    writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));

    // eslint-disable-next-line no-console
    console.log(
      `✓ PDF generated: ${outFile} (v${manifest.version}, hash ${contentHash}, ${generatedAt})`,
    );
  } catch (err) {
    restoreFromLastGood(`finalize: ${(err as Error).message}`);
  }
});
