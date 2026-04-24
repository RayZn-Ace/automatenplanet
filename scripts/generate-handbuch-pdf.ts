/**
 * Build-time generator: produces public/downloads/handbuch-boxautomat.pdf from
 * the shared content source at src/data/handbuchBoxautomat.ts.
 *
 * Run automatically before each `vite build` via the `prebuild` npm script,
 * so the downloadable PDF is always in sync with the website.
 *
 * Manual run:  bun run scripts/generate-handbuch-pdf.ts
 */

import { mkdirSync, createWriteStream, existsSync } from "node:fs";
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

// ---- Paths ------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outDir = resolve(projectRoot, "public/downloads");
const outFile = resolve(outDir, "handbuch-boxautomat.pdf");

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// ---- Theme ------------------------------------------------------------------
// Keep the PDF visually neutral and legible — it is a handbook, not a brochure.
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

// pdfkit uses WinAnsi for built-in fonts — strip emoji/non-WinAnsi glyphs that
// would otherwise crash the encoder.
const sanitize = (s: string): string =>
  s
    // Remove emoji and most pictographic ranges.
    .replace(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\u{2300}-\u{23FF}]/gu,
      "",
    )
    // Variation selectors / zero-width joiners.
    .replace(/[\u200D\uFE0F]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// ---- Document setup ---------------------------------------------------------
const doc = new PDFDocument({
  size: "A4",
  margins: { top: 60, bottom: 70, left: 60, right: 60 },
  info: {
    Title: HANDBUCH_BOXAUTOMAT_META.title,
    Author: HANDBUCH_BOXAUTOMAT_META.publisher.name,
    Subject: "Benutzerhandbuch Boxautomat",
    Keywords:
      "Boxautomat, Box Maschine, Kick Maschine, Handbuch, Wartung, Fehlerbehebung",
    Producer: "AutomatPlanet PDF Generator",
  },
});

doc.pipe(createWriteStream(outFile));

const pageWidth = doc.page.width;
const pageHeight = doc.page.height;
const contentWidth = pageWidth - doc.page.margins.left - doc.page.margins.right;

// ---- Footer hook ------------------------------------------------------------
// Draw on every page (including subsequent ones) by listening to pageAdded.
const drawFooter = () => {
  const y = pageHeight - 45;
  doc
    .save()
    .lineWidth(0.5)
    .strokeColor(COLORS.rule)
    .moveTo(doc.page.margins.left, y)
    .lineTo(pageWidth - doc.page.margins.right, y)
    .stroke()
    .restore();

  doc
    .font(FONT_REGULAR)
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text(
      `${HANDBUCH_BOXAUTOMAT_META.publisher.name} · ${HANDBUCH_BOXAUTOMAT_META.publisher.website} · ${HANDBUCH_BOXAUTOMAT_META.publisher.email}`,
      doc.page.margins.left,
      y + 6,
      { width: contentWidth, align: "left", lineBreak: false },
    )
    .text(
      `Stand ${HANDBUCH_BOXAUTOMAT_META.lastUpdated} · Version ${HANDBUCH_BOXAUTOMAT_META.version}`,
      doc.page.margins.left,
      y + 18,
      { width: contentWidth, align: "left", lineBreak: false },
    );

  // Page number on the right (kept on the same row).
  const pageLabel = `Seite ${(doc as unknown as { _pageBuffer?: unknown[] })._pageBuffer?.length ?? ""}`;
  doc.text(pageLabel, doc.page.margins.left, y + 6, {
    width: contentWidth,
    align: "right",
    lineBreak: false,
  });
};

doc.on("pageAdded", () => {
  // Reset position to top of writable area on every new page.
  doc.x = doc.page.margins.left;
  doc.y = doc.page.margins.top;
});

// ---- Helpers ----------------------------------------------------------------
const ensureSpace = (needed: number) => {
  const limit = pageHeight - doc.page.margins.bottom - 20;
  if (doc.y + needed > limit) doc.addPage();
};

const writeParagraph = (
  text: string,
  opts: { font?: string; size?: number; color?: string; gap?: number; indent?: number } = {},
) => {
  const {
    font = FONT_REGULAR,
    size = 10.5,
    color = COLORS.text,
    gap = 4,
    indent = 0,
  } = opts;
  const x = doc.page.margins.left + indent;
  const width = contentWidth - indent;
  doc.font(font).fontSize(size).fillColor(color);
  const height = doc.heightOfString(sanitize(text), { width });
  ensureSpace(height + gap);
  doc.text(sanitize(text), x, doc.y, { width, align: "left" });
  doc.moveDown(0.2);
  doc.y += gap;
};

const writeBullet = (item: string, ordered: boolean, index: number) => {
  const marker = ordered ? `${index + 1}.` : "•";
  const bulletWidth = 18;
  const x = doc.page.margins.left + 6;
  const textX = x + bulletWidth;
  const width = contentWidth - bulletWidth - 6;
  doc.font(FONT_REGULAR).fontSize(10.5).fillColor(COLORS.text);
  const height = doc.heightOfString(sanitize(item), { width });
  ensureSpace(height + 3);
  const startY = doc.y;
  doc.font(FONT_BOLD).text(marker, x, startY, { width: bulletWidth });
  doc.font(FONT_REGULAR).text(sanitize(item), textX, startY, { width });
  doc.moveDown(0.1);
};

const writeSubheading = (text: string) => {
  ensureSpace(28);
  doc.moveDown(0.4);
  doc
    .font(FONT_BOLD)
    .fontSize(12)
    .fillColor(COLORS.text)
    .text(sanitize(text), doc.page.margins.left, doc.y, { width: contentWidth });
  doc.moveDown(0.2);
};

const writeCallout = (
  variant: "info" | "warning",
  lines: string[],
  title?: string,
) => {
  const isWarning = variant === "warning";
  const bg = isWarning ? COLORS.warningBg : COLORS.calloutBg;
  const accent = isWarning ? COLORS.warning : COLORS.primary;

  const padding = 10;
  const innerWidth = contentWidth - padding * 2 - 6;
  doc.font(FONT_REGULAR).fontSize(10.5);
  let textHeight = 0;
  if (title) {
    doc.font(FONT_BOLD);
    textHeight += doc.heightOfString(sanitize(title), { width: innerWidth }) + 4;
    doc.font(FONT_REGULAR);
  }
  for (const line of lines) {
    textHeight +=
      doc.heightOfString(sanitize(`• ${line}`), { width: innerWidth }) + 2;
  }
  const boxHeight = textHeight + padding * 2;
  ensureSpace(boxHeight + 8);

  const x = doc.page.margins.left;
  const y = doc.y;
  doc
    .save()
    .rect(x, y, contentWidth, boxHeight)
    .fill(bg)
    .restore();
  doc
    .save()
    .rect(x, y, 4, boxHeight)
    .fill(accent)
    .restore();

  let cursorY = y + padding;
  if (title) {
    doc
      .font(FONT_BOLD)
      .fontSize(10.5)
      .fillColor(COLORS.text)
      .text(sanitize(title), x + padding + 6, cursorY, { width: innerWidth });
    cursorY = doc.y + 2;
  }
  doc.font(FONT_REGULAR).fontSize(10.5).fillColor(COLORS.text);
  for (const line of lines) {
    const text = lines.length === 1 && !title ? sanitize(line) : `• ${sanitize(line)}`;
    doc.text(text, x + padding + 6, cursorY, { width: innerWidth });
    cursorY = doc.y + 2;
  }
  doc.y = y + boxHeight + 6;
};

const writeTable = (rows: { label: string; value: string }[]) => {
  const labelWidth = contentWidth * 0.4;
  const valueWidth = contentWidth - labelWidth;
  const rowPadding = 8;

  for (const row of rows) {
    doc.font(FONT_BOLD).fontSize(10.5);
    const labelHeight = doc.heightOfString(sanitize(row.label), {
      width: labelWidth - rowPadding * 2,
    });
    doc.font(FONT_REGULAR);
    const valueHeight = doc.heightOfString(sanitize(row.value), {
      width: valueWidth - rowPadding * 2,
    });
    const rowHeight = Math.max(labelHeight, valueHeight) + rowPadding * 2;
    ensureSpace(rowHeight);

    const x = doc.page.margins.left;
    const y = doc.y;

    // Borders
    doc
      .save()
      .lineWidth(0.5)
      .strokeColor(COLORS.rule)
      .rect(x, y, contentWidth, rowHeight)
      .stroke()
      .moveTo(x + labelWidth, y)
      .lineTo(x + labelWidth, y + rowHeight)
      .stroke()
      .restore();

    // Label background
    doc.save().rect(x, y, labelWidth, rowHeight).fill(COLORS.tableHeader).restore();

    doc
      .font(FONT_BOLD)
      .fontSize(10.5)
      .fillColor(COLORS.text)
      .text(sanitize(row.label), x + rowPadding, y + rowPadding, {
        width: labelWidth - rowPadding * 2,
      });
    doc
      .font(FONT_REGULAR)
      .text(sanitize(row.value), x + labelWidth + rowPadding, y + rowPadding, {
        width: valueWidth - rowPadding * 2,
      });

    doc.y = y + rowHeight;
  }
  doc.moveDown(0.4);
};

const writeBlock = (block: HandbuchBlock) => {
  switch (block.type) {
    case "paragraph":
      writeParagraph(block.text, {
        font: block.emphasis ? FONT_BOLD : FONT_REGULAR,
      });
      return;
    case "subheading":
      writeSubheading(block.text);
      return;
    case "list":
      block.items.forEach((item, idx) => writeBullet(item, !!block.ordered, idx));
      doc.moveDown(0.3);
      return;
    case "callout":
      writeCallout(block.variant, block.lines, block.title);
      return;
    case "table":
      writeTable(block.rows);
      return;
  }
};

const writeSection = (section: HandbuchSection, index: number) => {
  // Each top-level section starts on its own page after the first to keep
  // the layout predictable and easy to navigate.
  if (index > 0) doc.addPage();
  ensureSpace(40);
  doc
    .font(FONT_BOLD)
    .fontSize(18)
    .fillColor(COLORS.primary)
    .text(`${section.number}. ${section.title}`, doc.page.margins.left, doc.y, {
      width: contentWidth,
    });
  doc
    .save()
    .lineWidth(1)
    .strokeColor(COLORS.primary)
    .moveTo(doc.page.margins.left, doc.y + 4)
    .lineTo(doc.page.margins.left + 50, doc.y + 4)
    .stroke()
    .restore();
  doc.moveDown(0.8);

  for (const block of section.blocks) writeBlock(block);
};

// ---- Cover ------------------------------------------------------------------
doc
  .font(FONT_BOLD)
  .fontSize(11)
  .fillColor(COLORS.primary)
  .text(HANDBUCH_BOXAUTOMAT_META.subtitle.toUpperCase(), {
    width: contentWidth,
    characterSpacing: 2,
  });

doc.moveDown(0.4);
doc
  .font(FONT_BOLD)
  .fontSize(28)
  .fillColor(COLORS.text)
  .text(HANDBUCH_BOXAUTOMAT_META.product, { width: contentWidth });

doc.moveDown(0.3);
doc
  .font(FONT_ITALIC)
  .fontSize(11)
  .fillColor(COLORS.muted)
  .text(
    `Artikelnummer ${HANDBUCH_BOXAUTOMAT_META.articleNumber} · Stand ${HANDBUCH_BOXAUTOMAT_META.lastUpdated}`,
    { width: contentWidth },
  );

doc.moveDown(1.5);
doc
  .font(FONT_REGULAR)
  .fontSize(10.5)
  .fillColor(COLORS.text)
  .text(HANDBUCH_BOXAUTOMAT_META.publisher.name, { width: contentWidth })
  .text(HANDBUCH_BOXAUTOMAT_META.publisher.address, { width: contentWidth })
  .text(
    `${HANDBUCH_BOXAUTOMAT_META.publisher.email} · ${HANDBUCH_BOXAUTOMAT_META.publisher.website}`,
    { width: contentWidth },
  );

doc.moveDown(2);
doc
  .save()
  .lineWidth(0.5)
  .strokeColor(COLORS.rule)
  .moveTo(doc.page.margins.left, doc.y)
  .lineTo(pageWidth - doc.page.margins.right, doc.y)
  .stroke()
  .restore();
doc.moveDown(1);

// ---- Table of contents ------------------------------------------------------
doc
  .font(FONT_BOLD)
  .fontSize(14)
  .fillColor(COLORS.text)
  .text("Inhaltsverzeichnis", { width: contentWidth });
doc.moveDown(0.6);
doc.font(FONT_REGULAR).fontSize(10.5).fillColor(COLORS.text);
HANDBUCH_BOXAUTOMAT_SECTIONS.forEach((section) => {
  doc.text(`${section.number}. ${sanitize(section.title)}`, {
    width: contentWidth,
    indent: 8,
  });
});
doc.text(`${HANDBUCH_BOXAUTOMAT_SECTIONS.length + 1}. Häufig gestellte Fragen`, {
  width: contentWidth,
  indent: 8,
});
doc.text(`${HANDBUCH_BOXAUTOMAT_SECTIONS.length + 2}. Support & Kontakt`, {
  width: contentWidth,
  indent: 8,
});

// ---- Sections ---------------------------------------------------------------
HANDBUCH_BOXAUTOMAT_SECTIONS.forEach(writeSection);

// ---- FAQ --------------------------------------------------------------------
doc.addPage();
doc
  .font(FONT_BOLD)
  .fontSize(18)
  .fillColor(COLORS.primary)
  .text(`${HANDBUCH_BOXAUTOMAT_SECTIONS.length + 1}. Häufig gestellte Fragen`, {
    width: contentWidth,
  });
doc
  .save()
  .lineWidth(1)
  .strokeColor(COLORS.primary)
  .moveTo(doc.page.margins.left, doc.y + 4)
  .lineTo(doc.page.margins.left + 50, doc.y + 4)
.stroke()
.restore();
doc.moveDown(0.8);

HANDBUCH_BOXAUTOMAT_FAQ.forEach((item) => {
  ensureSpace(40);
  doc
    .font(FONT_BOLD)
    .fontSize(11.5)
    .fillColor(COLORS.text)
    .text(sanitize(item.question), { width: contentWidth });
  doc.moveDown(0.2);
  doc
    .font(FONT_REGULAR)
    .fontSize(10.5)
    .fillColor(COLORS.text)
    .text(sanitize(item.answer), { width: contentWidth });
  doc.moveDown(0.6);
});

// ---- Support ----------------------------------------------------------------
doc.addPage();
doc
  .font(FONT_BOLD)
  .fontSize(18)
  .fillColor(COLORS.primary)
  .text(`${HANDBUCH_BOXAUTOMAT_SECTIONS.length + 2}. Support & Kontakt`, {
    width: contentWidth,
  });
doc.moveDown(0.8);
doc
  .font(FONT_REGULAR)
  .fontSize(11)
  .fillColor(COLORS.text)
  .text("Bei Fragen oder Problemen wenden Sie sich bitte an:", {
    width: contentWidth,
  });
doc.moveDown(0.6);
doc.font(FONT_BOLD).text(HANDBUCH_BOXAUTOMAT_META.publisher.name);
doc.font(FONT_REGULAR).text(HANDBUCH_BOXAUTOMAT_META.publisher.address);
doc.text(`E-Mail: ${HANDBUCH_BOXAUTOMAT_META.publisher.email}`);
doc.text(`Web:    ${HANDBUCH_BOXAUTOMAT_META.publisher.website}`);

// Footer on every page (including the first/cover).
// We need to draw it after each page is fully written, so flush at the end:
const range = doc.bufferedPageRange?.() ?? { start: 0, count: 1 };
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  drawFooter();
}

doc.end();

// eslint-disable-next-line no-console
console.log(`✓ PDF generated: ${outFile}`);
