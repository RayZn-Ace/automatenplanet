import { useEffect, useRef, useState } from "react";
import { Download, AlertTriangle, Info, Loader2, CheckCircle2, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  // Progress state
  type Stage = "idle" | "connecting" | "generating" | "downloading" | "ready" | "error";
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [bytesReceived, setBytesReceived] = useState(0);
  const [bytesTotal, setBytesTotal] = useState<number | null>(null);
  const [readyBlobUrl, setReadyBlobUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const tickRef = useRef<number | null>(null);

  // Cleanup blob URL on unmount or when a new download starts.
  useEffect(() => {
    return () => {
      if (readyBlobUrl) URL.revokeObjectURL(readyBlobUrl);
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        setUnavailable(true);
      }
      await loadManifest();
    })();

    return () => {
      cancelled = true;
    };
  }, [primaryUrl, fallback, manifest, dynamicFunctionName]);

  const stageLabels: Record<Stage, string> = {
    idle: "",
    connecting: "Verbindung wird hergestellt …",
    generating: "PDF wird auf dem Server erzeugt …",
    downloading: "PDF wird heruntergeladen …",
    ready: "PDF bereit",
    error: "Fehler bei der Erzeugung",
  };

  const resetProgress = () => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (readyBlobUrl) {
      URL.revokeObjectURL(readyBlobUrl);
      setReadyBlobUrl(null);
    }
    setProgress(0);
    setBytesReceived(0);
    setBytesTotal(null);
    setErrorMsg(null);
  };

  // While the server is rendering (no bytes yet), we don't get real progress
  // back from the edge function. Simulate a smooth crawl from 10 → 60 % so
  // the user sees activity instead of a frozen bar.
  const startGenerationTicker = () => {
    if (tickRef.current !== null) return;
    tickRef.current = window.setInterval(() => {
      setProgress((p) => (p < 60 ? p + 1.5 : p));
    }, 120);
  };

  const stopGenerationTicker = () => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const fetchPdfWithProgress = async (): Promise<Blob> => {
    // Build the function URL directly so we can use fetch + ReadableStream
    // for byte-level progress (supabase.functions.invoke buffers internally).
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
    const url = `https://${projectId}.supabase.co/functions/v1/${dynamicFunctionName}`;

    setStage("connecting");
    setProgress(5);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

    setStage("generating");
    setProgress(10);
    startGenerationTicker();

    const totalHeader = res.headers.get("content-length");
    const total = totalHeader ? Number(totalHeader) : null;
    if (total) setBytesTotal(total);

    if (!res.body) {
      // Fallback: no streaming → read the whole blob at once.
      stopGenerationTicker();
      setStage("downloading");
      setProgress(80);
      const blob = await res.blob();
      setBytesReceived(blob.size);
      setProgress(100);
      return blob;
    }

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    let firstChunk = true;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        if (firstChunk) {
          // First byte → server has finished generating, real download starts.
          stopGenerationTicker();
          setStage("downloading");
          setProgress((p) => Math.max(p, 65));
          firstChunk = false;
        }
        chunks.push(value);
        received += value.length;
        setBytesReceived(received);
        if (total) {
          // Map 65 % → 99 % to the real byte progress.
          const pct = 65 + (received / total) * 34;
          setProgress(Math.min(99, pct));
        } else {
          setProgress((p) => Math.min(95, p + 0.5));
        }
      }
    }

    setProgress(100);
    return new Blob(chunks as BlobPart[], { type: "application/pdf" });
  };

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!dynamicFunctionName) return; // let the <a href> default action run
    e.preventDefault();
    resetProgress();
    setLoading(true);
    setStage("connecting");
    try {
      let blob: Blob;
      try {
        blob = await fetchPdfWithProgress();
      } catch (streamErr) {
        // Fallback to supabase-js if the direct fetch failed (e.g. CORS).
        console.warn("Streaming fetch failed, retrying via supabase-js:", streamErr);
        stopGenerationTicker();
        setStage("generating");
        setProgress(50);
        const { data, error } = await supabase.functions.invoke(
          dynamicFunctionName,
          { method: "GET" },
        );
        if (error) throw error;
        blob =
          data instanceof Blob
            ? data
            : new Blob([data as ArrayBuffer], { type: "application/pdf" });
        setProgress(100);
      }
      if (!blob.size) throw new Error("PDF leer (0 Bytes)");

      // Build a downloadable URL and surface it as a persistent link.
      const objectUrl = URL.createObjectURL(blob);
      setReadyBlobUrl(objectUrl);
      setBytesTotal(blob.size);
      setBytesReceived(blob.size);
      setStage("ready");

      // Auto-trigger the browser download.
      triggerBlobDownload(blob, fileName);
    } catch (err) {
      stopGenerationTicker();
      console.error("Dynamic PDF generation failed, using static fallback:", err);
      setStage("error");
      setErrorMsg(
        "Dynamische Generierung fehlgeschlagen – statische Version wird geladen.",
      );
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

      {(loading || stage === "ready" || stage === "error") && stage !== "idle" && (
        <div
          className="w-full max-w-md mt-1 rounded-md border bg-card/50 px-3 py-2.5"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
            <span className="inline-flex items-center gap-1.5 font-medium">
              {stage === "ready" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              ) : stage === "error" ? (
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              ) : (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              {stageLabels[stage]}
            </span>
            <span className="font-mono tabular-nums text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
          {(bytesReceived > 0 || bytesTotal) && (
            <p className="mt-1.5 text-[11px] text-muted-foreground font-mono tabular-nums">
              {formatSize(bytesReceived)}
              {bytesTotal ? ` / ${formatSize(bytesTotal)}` : ""}
            </p>
          )}
        </div>
      )}

      {stage === "ready" && readyBlobUrl && (
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <Button asChild size="sm" variant="secondary" className="gap-2">
            <a href={readyBlobUrl} download={fileName}>
              <Download className="h-4 w-4" />
              Erneut speichern
            </a>
          </Button>
          <a
            href={readyBlobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Im neuen Tab öffnen
          </a>
        </div>
      )}

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
