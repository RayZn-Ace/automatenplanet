// Edge Function: generate-handbuch-pdf
// Renders the Boxautomat manual to a PDF on demand and streams it back.
//
// Usage from the browser:
//   GET  /functions/v1/generate-handbuch-pdf            -> returns the PDF
//   HEAD /functions/v1/generate-handbuch-pdf            -> headers only (probe)
//
// The renderer mirrors scripts/generate-handbuch-pdf.ts so the on-demand PDF
// is identical to the build-time one.

// @ts-ignore -- npm specifier resolved at runtime by Deno edge runtime
import PDFDocument from "npm:pdfkit@0.15.0";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import {
  EXPECTED_CONTENT_HASH,
  HANDBUCH_BOXAUTOMAT_FAQ,
  HANDBUCH_BOXAUTOMAT_META,
  HANDBUCH_BOXAUTOMAT_SECTIONS,
  HANDBUCH_IMAGE_ASSETS_BASE64,
  SYNCED_AT,
  type HandbuchBlock,
  type HandbuchSection,
} from "./handbuch-data.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
};

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
const MARGIN = { top: 60, bottom: 75, left: 60, right: 60 };

const sanitize = (s: string): string =>
  s
    .replace(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\u{2300}-\u{23FF}]/gu,
      "",
    )
    .replace(/[\u200D\uFE0F]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Build the PDF and return it as a single Uint8Array.
async function renderPdf(): Promise<{ bytes: Uint8Array; contentHash: string; generatedAt: string }> {
  const contentPayload = JSON.stringify({
    meta: HANDBUCH_BOXAUTOMAT_META,
    sections: HANDBUCH_BOXAUTOMAT_SECTIONS,
    faq: HANDBUCH_BOXAUTOMAT_FAQ,
  });
  const contentHash = createHash("sha256").update(contentPayload).digest("hex").slice(0, 10);
  const generatedAt = new Date().toISOString();

  // deno-lint-ignore no-explicit-any
  const doc: any = new PDFDocument({
    size: "A4",
    margins: MARGIN,
    bufferPages: true,
    autoFirstPage: true,
    info: {
      Title: HANDBUCH_BOXAUTOMAT_META.title,
      Author: HANDBUCH_BOXAUTOMAT_META.publisher.name,
      Subject: "Benutzerhandbuch Boxautomat",
      Keywords: "Boxautomat, Box Maschine, Kick Maschine, Handbuch, Wartung, Fehlerbehebung",
      Producer: "AutomatPlanet PDF Generator (edge)",
    },
  });

  const PAGE_W = doc.page.width;
  const PAGE_H = doc.page.height;
  const CONTENT_W = PAGE_W - MARGIN.left - MARGIN.right;
  const CONTENT_BOTTOM = PAGE_H - MARGIN.bottom;
  const TXT = { characterSpacing: 0, wordSpacing: 0 } as const;

  const resetStyle = () => {
    doc.font(FONT_REGULAR).fontSize(BODY_SIZE).fillColor(COLORS.text);
  };

  const ensureSpace = (needed: number) => {
    if (doc.y + needed > CONTENT_BOTTOM) {
      doc.addPage();
      doc.x = MARGIN.left;
      doc.y = MARGIN.top;
    }
  };

  const writeParagraph = (
    text: string,
    opts: { font?: string; size?: number; color?: string; gapAfter?: number } = {},
  ) => {
    const { font = FONT_REGULAR, size = BODY_SIZE, color = COLORS.text, gapAfter = 6 } = opts;
    resetStyle();
    doc.font(font).fontSize(size).fillColor(color);
    const txt = sanitize(text);
    const h = doc.heightOfString(txt, { ...TXT, width: CONTENT_W });
    ensureSpace(h);
    doc.text(txt, MARGIN.left, doc.y, { ...TXT, width: CONTENT_W, align: "left" });
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
    const h = doc.heightOfString(txt, { ...TXT, width: wText });
    ensureSpace(h + 2);
    const startY = doc.y;
    doc.text(marker, xMarker, startY, { ...TXT, width: markerW, lineBreak: false });
    doc.text(txt, xText, startY, { ...TXT, width: wText });
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
      .text(sanitize(text), MARGIN.left, doc.y, { ...TXT, width: CONTENT_W });
    doc.y += 4;
  };

  const writeCallout = (variant: "info" | "warning", lines: string[], title?: string) => {
    resetStyle();
    const isWarning = variant === "warning";
    const bg = isWarning ? COLORS.warningBg : COLORS.calloutBg;
    const accent = isWarning ? COLORS.warning : COLORS.primary;
    const padding = 10;
    const accentW = 4;
    const innerX = MARGIN.left + accentW + padding;
    const innerW = CONTENT_W - accentW - padding * 2;

    doc.font(FONT_REGULAR).fontSize(BODY_SIZE);
    let totalTextH = 0;
    if (title) {
      doc.font(FONT_BOLD);
      totalTextH += doc.heightOfString(sanitize(title), { ...TXT, width: innerW }) + 4;
      doc.font(FONT_REGULAR);
    }
    for (const line of lines) {
      const txt = lines.length === 1 && !title ? sanitize(line) : `• ${sanitize(line)}`;
      totalTextH += doc.heightOfString(txt, { ...TXT, width: innerW }) + 2;
    }
    const boxH = totalTextH + padding * 2;
    ensureSpace(boxH + 8);

    const x = MARGIN.left;
    const y = doc.y;
    doc.save().rect(x, y, CONTENT_W, boxH).fill(bg).restore();
    doc.save().rect(x, y, accentW, boxH).fill(accent).restore();

    let cy = y + padding;
    if (title) {
      doc.font(FONT_BOLD).fontSize(BODY_SIZE).fillColor(COLORS.text)
        .text(sanitize(title), innerX, cy, { ...TXT, width: innerW });
      cy = doc.y + 2;
    }
    doc.font(FONT_REGULAR).fontSize(BODY_SIZE).fillColor(COLORS.text);
    for (const line of lines) {
      const txt = lines.length === 1 && !title ? sanitize(line) : `• ${sanitize(line)}`;
      doc.text(txt, innerX, cy, { ...TXT, width: innerW });
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
      const lh = doc.heightOfString(sanitize(row.label), { ...TXT, width: labelW - padding * 2 });
      doc.font(FONT_REGULAR);
      const vh = doc.heightOfString(sanitize(row.value), { ...TXT, width: valueW - padding * 2 });
      const rowH = Math.max(lh, vh) + padding * 2;
      ensureSpace(rowH);

      const x = MARGIN.left;
      const y = doc.y;
      doc.save().rect(x, y, labelW, rowH).fill(COLORS.tableHeader).restore();
      doc.save().lineWidth(0.5).strokeColor(COLORS.rule)
        .rect(x, y, CONTENT_W, rowH).stroke()
        .moveTo(x + labelW, y).lineTo(x + labelW, y + rowH).stroke()
        .restore();

      doc.font(FONT_BOLD).fontSize(BODY_SIZE).fillColor(COLORS.text)
        .text(sanitize(row.label), x + padding, y + padding, { ...TXT, width: labelW - padding * 2 });
      doc.font(FONT_REGULAR)
        .text(sanitize(row.value), x + labelW + padding, y + padding, { ...TXT, width: valueW - padding * 2 });

      doc.y = y + rowH;
    }
    doc.y += 6;
  };

  const decodeBase64 = (b64: string): Uint8Array => {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  };

  const writeImage = (
    assetKey: string,
    caption: string | undefined,
    maxWidthPct: number,
  ) => {
    const asset = HANDBUCH_IMAGE_ASSETS_BASE64?.[assetKey];
    if (!asset) {
      console.warn(`Unknown image asset "${assetKey}" – skipping in edge PDF.`);
      return;
    }
    let bytes: Uint8Array;
    try {
      bytes = decodeBase64(asset.base64);
    } catch (err) {
      console.warn(`Failed to decode image "${assetKey}":`, (err as Error).message);
      return;
    }

    const pct = Math.min(100, Math.max(10, maxWidthPct || 100));
    const targetW = (CONTENT_W * pct) / 100;
    const captionH = caption ? 16 : 0;
    if (CONTENT_BOTTOM - doc.y < 120) {
      doc.addPage();
      doc.x = MARGIN.left;
      doc.y = MARGIN.top;
    }
    const availH = CONTENT_BOTTOM - doc.y - captionH - 8;

    // Convert Uint8Array to Buffer-compatible input pdfkit accepts.
    // pdfkit (npm) works with Buffer in Node and with Uint8Array via Buffer.from.
    // Deno's Node compat ships Buffer.
    // deno-lint-ignore no-explicit-any
    const buf = (globalThis as any).Buffer ? (globalThis as any).Buffer.from(bytes) : bytes;

    doc.image(buf, MARGIN.left, doc.y, { fit: [targetW, availH], align: "left" });
    // deno-lint-ignore no-explicit-any
    const img: any = (doc as any).openImage(buf);
    const scale = Math.min(targetW / img.width, availH / img.height);
    const renderedH = img.height * scale;
    doc.y += renderedH + 6;

    if (caption) {
      doc.font(FONT_ITALIC).fontSize(BODY_SIZE - 1).fillColor(COLORS.muted)
        .text(sanitize(caption), MARGIN.left, doc.y, { ...TXT, width: CONTENT_W });
      resetStyle();
      doc.y += 6;
    }
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
        writeImage(block.assetKey, block.caption, block.maxWidthPct ?? 100);
        return;
    }
  };

  const writeSectionHeading = (number: string, title: string) => {
    resetStyle();
    ensureSpace(48);
    doc.font(FONT_BOLD).fontSize(18).fillColor(COLORS.primary)
      .text(`${number}. ${sanitize(title)}`, MARGIN.left, doc.y, { ...TXT, width: CONTENT_W });
    const lineY = doc.y + 2;
    doc.save().lineWidth(1.5).strokeColor(COLORS.primary)
      .moveTo(MARGIN.left, lineY).lineTo(MARGIN.left + 50, lineY).stroke().restore();
    doc.y = lineY + 14;
  };

  const writeSection = (section: HandbuchSection) => {
    writeSectionHeading(section.number, section.title);
    for (const block of section.blocks) writeBlock(block);
  };

  // ---- Cover ----
  resetStyle();
  doc.font(FONT_BOLD).fontSize(11).fillColor(COLORS.primary)
    .text(HANDBUCH_BOXAUTOMAT_META.subtitle.toUpperCase(), MARGIN.left, doc.y, { ...TXT, width: CONTENT_W });
  doc.y += 4;
  doc.font(FONT_BOLD).fontSize(26).fillColor(COLORS.text)
    .text(sanitize(HANDBUCH_BOXAUTOMAT_META.product), MARGIN.left, doc.y, { ...TXT, width: CONTENT_W });
  doc.y += 4;
  doc.font(FONT_ITALIC).fontSize(11).fillColor(COLORS.muted)
    .text(
      `Artikelnummer ${HANDBUCH_BOXAUTOMAT_META.articleNumber} - Stand ${HANDBUCH_BOXAUTOMAT_META.lastUpdated}`,
      MARGIN.left, doc.y, { ...TXT, width: CONTENT_W },
    );
  doc.y += 18;
  resetStyle();
  doc.text(HANDBUCH_BOXAUTOMAT_META.publisher.name, MARGIN.left, doc.y, { ...TXT, width: CONTENT_W })
    .text(HANDBUCH_BOXAUTOMAT_META.publisher.address, { ...TXT, width: CONTENT_W })
    .text(`${HANDBUCH_BOXAUTOMAT_META.publisher.email} - ${HANDBUCH_BOXAUTOMAT_META.publisher.website}`, { ...TXT, width: CONTENT_W });
  doc.y += 16;
  doc.save().lineWidth(0.5).strokeColor(COLORS.rule)
    .moveTo(MARGIN.left, doc.y).lineTo(PAGE_W - MARGIN.right, doc.y).stroke().restore();
  doc.y += 12;

  doc.font(FONT_BOLD).fontSize(14).fillColor(COLORS.text)
    .text("Inhaltsverzeichnis", MARGIN.left, doc.y, { ...TXT, width: CONTENT_W });
  doc.y += 8;
  doc.font(FONT_REGULAR).fontSize(BODY_SIZE).fillColor(COLORS.text);
  HANDBUCH_BOXAUTOMAT_SECTIONS.forEach((section) => {
    doc.text(`${section.number}. ${sanitize(section.title)}`, MARGIN.left + 12, doc.y, { ...TXT, width: CONTENT_W - 12 });
  });
  doc.text(`${HANDBUCH_BOXAUTOMAT_SECTIONS.length + 1}. Häufig gestellte Fragen`, MARGIN.left + 12, doc.y, { ...TXT, width: CONTENT_W - 12 });
  doc.text(`${HANDBUCH_BOXAUTOMAT_SECTIONS.length + 2}. Support & Kontakt`, MARGIN.left + 12, doc.y, { ...TXT, width: CONTENT_W - 12 });

  // ---- Sections ----
  HANDBUCH_BOXAUTOMAT_SECTIONS.forEach((section, idx) => {
    if (idx > 0) { ensureSpace(28); doc.y += 12; } else { doc.y += 14; }
    writeSection(section);
  });

  // ---- FAQ ----
  ensureSpace(60);
  doc.y += 12;
  writeSectionHeading(String(HANDBUCH_BOXAUTOMAT_SECTIONS.length + 1), "Häufig gestellte Fragen");
  HANDBUCH_BOXAUTOMAT_FAQ.forEach((item) => {
    resetStyle();
    ensureSpace(40);
    doc.font(FONT_BOLD).fontSize(11.5).fillColor(COLORS.text)
      .text(sanitize(item.question), MARGIN.left, doc.y, { ...TXT, width: CONTENT_W });
    doc.y += 2;
    doc.font(FONT_REGULAR).fontSize(BODY_SIZE).fillColor(COLORS.text)
      .text(sanitize(item.answer), MARGIN.left, doc.y, { ...TXT, width: CONTENT_W });
    doc.y += 8;
  });

  // ---- Support ----
  ensureSpace(60);
  doc.y += 12;
  writeSectionHeading(String(HANDBUCH_BOXAUTOMAT_SECTIONS.length + 2), "Support & Kontakt");
  resetStyle();
  doc.text("Bei Fragen oder Problemen wenden Sie sich bitte an:", MARGIN.left, doc.y, { ...TXT, width: CONTENT_W });
  doc.y += 6;
  doc.font(FONT_BOLD).text(HANDBUCH_BOXAUTOMAT_META.publisher.name);
  doc.font(FONT_REGULAR).text(HANDBUCH_BOXAUTOMAT_META.publisher.address);
  doc.text(`E-Mail: ${HANDBUCH_BOXAUTOMAT_META.publisher.email}`);
  doc.text(`Web:    ${HANDBUCH_BOXAUTOMAT_META.publisher.website}`);

  // ---- Footer on every page ----
  const range = doc.bufferedPageRange();
  const totalPages = range.count;
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const pageNum = i - range.start + 1;
    const footerY = PAGE_H - MARGIN.bottom + 25;
    doc.save().lineWidth(0.5).strokeColor(COLORS.rule)
      .moveTo(MARGIN.left, footerY - 8).lineTo(PAGE_W - MARGIN.right, footerY - 8).stroke().restore();
    doc.font(FONT_REGULAR).fontSize(8).fillColor(COLORS.muted);
    doc.text(
      `${HANDBUCH_BOXAUTOMAT_META.publisher.name} - ${HANDBUCH_BOXAUTOMAT_META.publisher.website}`,
      MARGIN.left, footerY,
      { ...TXT, width: CONTENT_W / 2, align: "left", lineBreak: false },
    );
    doc.text(
      `Stand ${HANDBUCH_BOXAUTOMAT_META.lastUpdated} - v${HANDBUCH_BOXAUTOMAT_META.version} - ${contentHash}`,
      MARGIN.left, footerY,
      { ...TXT, width: CONTENT_W, align: "center", lineBreak: false },
    );
    doc.text(`Seite ${pageNum} / ${totalPages}`, MARGIN.left, footerY, { ...TXT, width: CONTENT_W, align: "right", lineBreak: false });
  }

  // Collect chunks into a single Uint8Array
  const chunks: Uint8Array[] = [];
  doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
  const done = new Promise<void>((resolve, reject) => {
    doc.on("end", () => resolve());
    doc.on("error", (err: Error) => reject(err));
  });
  doc.end();
  await done;

  let total = 0;
  for (const c of chunks) total += c.length;
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { bytes.set(c, offset); offset += c.length; }

  return { bytes, contentHash, generatedAt };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { bytes, contentHash, generatedAt } = await renderPdf();

    // Drift detection: compare the hash recomputed at request time against
    // the EXPECTED_CONTENT_HASH that the build script pinned when it last
    // synced the data file. If they differ, the function is serving newer
    // content than the build expected — surface that in headers + logs so
    // it's obvious during debugging.
    const inSync = contentHash === EXPECTED_CONTENT_HASH;
    if (!inSync) {
      console.warn(
        `⚠ Content drift: runtime hash ${contentHash} ≠ expected ${EXPECTED_CONTENT_HASH} (synced ${SYNCED_AT}). PDF still served.`,
      );
    } else {
      console.log(
        `✓ PDF rendered (${bytes.byteLength} bytes, hash ${contentHash}, in sync with build ${SYNCED_AT}).`,
      );
    }

    const headers = {
      ...corsHeaders,
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="handbuch-boxautomat.pdf"',
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=300",
      "X-Pdf-Version": HANDBUCH_BOXAUTOMAT_META.version,
      "X-Pdf-Content-Hash": contentHash,
      "X-Pdf-Expected-Hash": EXPECTED_CONTENT_HASH,
      "X-Pdf-In-Sync": String(inSync),
      "X-Pdf-Synced-At": SYNCED_AT,
      "X-Pdf-Generated-At": generatedAt,
    };

    if (req.method === "HEAD") {
      return new Response(null, { status: 200, headers });
    }
    // Wrap in Blob for cross-runtime BodyInit compatibility
    return new Response(new Blob([bytes], { type: "application/pdf" }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: "PDF generation failed", message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
