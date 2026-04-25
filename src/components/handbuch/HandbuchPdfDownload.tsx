import { useEffect, useRef, useState } from "react";
import { Download, AlertTriangle, Info, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface PdfManifest {
  version: string;
  contentHash: string;
  generatedAt: string;
  lastUpdated: string;
  sizeBytes: number;
  sourceSections?: number;
  pdfPath: string;
}

interface HandbuchPdfDownloadProps {
  /** Static fallback PDF URL (e.g. /downloads/handbuch-boxautomat.pdf) */
  primaryUrl: string;
  /**
   * Optional fallback URL. Defaults to `<primary>.last-good.pdf` derived from
   * the primary path (e.g. handbuch-boxautomat.last-good.pdf).
   */
  fallbackUrl?: string;
  /**
   * Optional manifest URL. Defaults to `<primary>.manifest.json` (written by
   * the build script). Used to display version + last-generated info.
   */
  manifestUrl?: string;
  /**
   * Edge function name that generates the PDF on demand.
   * When provided (default: "generate-handbuch-pdf"), clicking the button
   * invokes the function, downloads the freshly-generated PDF as a Blob,
   * and falls back to the static file on error.
   * Pass `null` to disable dynamic generation entirely.
   */
  dynamicFunctionName?: string | null;
  /** Suggested filename for the download. */
  fileName?: string;
  ariaLabel?: string;
  children?: React.ReactNode;
}

const deriveFallback = (url: string) =>
  url.replace(/\.pdf(\?.*)?$/i, ".last-good.pdf$1");

const deriveManifest = (url: string) =>
  url.replace(/\.pdf(\?.*)?$/i, ".manifest.json$1");

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("de-DE", {
      dateStyle: "long",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const triggerBlobDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a tick so the navigation can start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Download button for the handbook PDF.
 *
 * Behavior:
 *  1. On click, calls the `generate-handbuch-pdf` edge function which renders
 *     the PDF on demand from the current page content.
 *  2. If the edge function fails, transparently falls back to the static
 *     /downloads/handbuch-boxautomat.pdf (or its `.last-good.pdf` snapshot).
 *  3. Also probes the static file on mount so we can show an availability
 *     warning if both the function AND the static file are unreachable.
 */
const HandbuchPdfDownload = ({
  primaryUrl,
  fallbackUrl,
  manifestUrl,
  dynamicFunctionName = "generate-handbuch-pdf",
  fileName = "handbuch-boxautomat.pdf",
  ariaLabel,
  children,
}: HandbuchPdfDownloadProps) => {
  const fallback = fallbackUrl ?? deriveFallback(primaryUrl);
  const manifest = manifestUrl ?? deriveManifest(primaryUrl);
  const [staticUrl, setStaticUrl] = useState(primaryUrl);
  const [usingFallback, setUsingFallback] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [info, setInfo] = useState<PdfManifest | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const probe = async (url: string) => {
      try {
        const res = await fetch(url, { method: "HEAD", cache: "no-store" });
        if (!res.ok) return false;
        const len = res.headers.get("content-length");
        if (len !== null && Number(len) === 0) return false;
        return true;
      } catch {
        return false;
      }
    };

    const loadManifest = async () => {
      try {
        const res = await fetch(manifest, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as PdfManifest;
        if (!cancelled) setInfo(data);
      } catch {
        /* manifest is optional */
      }
    };

    (async () => {
      if (await probe(primaryUrl)) {
        if (!cancelled) {
          setStaticUrl(primaryUrl);
          setUsingFallback(false);
        }
      } else if (await probe(fallback)) {
        if (!cancelled) {
          setStaticUrl(fallback);
          setUsingFallback(true);
        }
      } else if (!cancelled && !dynamicFunctionName) {
        // No static file AND no dynamic generator → unavailable
        setUnavailable(true);
      }
      await loadManifest();
    })();

    return () => {
      cancelled = true;
    };
  }, [primaryUrl, fallback, manifest, dynamicFunctionName]);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!dynamicFunctionName) return; // let the <a href> default action run
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        dynamicFunctionName,
        { method: "GET" },
      );
      if (error) throw error;
      // supabase-js returns the body as a Blob for binary content types
      const blob =
        data instanceof Blob
          ? data
          : new Blob([data as ArrayBuffer], { type: "application/pdf" });
      if (!blob.size) throw new Error("PDF leer (0 Bytes)");
      triggerBlobDownload(blob, fileName);
    } catch (err) {
      console.error("Dynamic PDF generation failed, using static fallback:", err);
      setErrorMsg(
        "Dynamische Generierung fehlgeschlagen – statische Version wird geladen.",
      );
      // Trigger the static download as a fallback
      const a = document.createElement("a");
      a.href = staticUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setLoading(false);
    }
  };

  if (unavailable) {
    return (
      <div
        role="alert"
        className="inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
      >
        <AlertTriangle className="h-4 w-4" />
        PDF aktuell nicht verfügbar – bitte später erneut versuchen.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button asChild size="lg" className="gap-2" disabled={loading}>
        <a
          href={staticUrl}
          download={fileName}
          aria-label={ariaLabel}
          onClick={handleClick}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          {loading
            ? "PDF wird erzeugt …"
            : (children ?? "Handbuch als PDF herunterladen")}
        </a>
      </Button>

      {info && (
        <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            Version <strong className="text-foreground">{info.version}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Zuletzt aktualisiert{" "}
            <time dateTime={info.generatedAt} className="text-foreground">
              {formatDate(info.generatedAt)}
            </time>
          </span>
          <span aria-hidden="true">·</span>
          <span>{formatSize(info.sizeBytes)}</span>
          <span aria-hidden="true">·</span>
          <span title="Hash über den Seiteninhalt">
            Inhalt&nbsp;
            <code className="font-mono text-foreground/80">{info.contentHash}</code>
          </span>
        </p>
      )}

      {dynamicFunctionName && !errorMsg && (
        <p className="text-xs text-muted-foreground">
          Wird beim Klick frisch aus dem aktuellen Seiteninhalt erzeugt.
        </p>
      )}

      {usingFallback && (
        <p className="text-xs text-destructive">
          ⚠ Statische PDF-Version veraltet – letzte erfolgreiche Sicherung wird
          als Fallback verwendet.
        </p>
      )}

      {errorMsg && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}
    </div>
  );
};

export default HandbuchPdfDownload;
