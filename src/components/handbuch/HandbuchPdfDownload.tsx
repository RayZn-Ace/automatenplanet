import { useEffect, useRef, useState } from "react";
import { Download, AlertTriangle, Info, Loader2, CheckCircle2, Eye, ExternalLink, X } from "lucide-react";
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

class PdfHttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public bodyText?: string,
    public retryAfter?: number | null,
  ) {
    super(`HTTP ${status} ${statusText}`.trim());
    this.name = "PdfHttpError";
  }
}

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
  const [errorDetail, setErrorDetail] = useState<{
    status?: number;
    statusText?: string;
    body?: string;
    retryAfter?: number | null;
  } | null>(null);

  // Progress state
  type Stage = "idle" | "connecting" | "generating" | "downloading" | "ready" | "error";
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [bytesReceived, setBytesReceived] = useState(0);
  const [bytesTotal, setBytesTotal] = useState<number | null>(null);
  const [readyBlobUrl, setReadyBlobUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  type CacheStatus = "HIT" | "MISS" | "REVALIDATED" | "FALLBACK" | "UNKNOWN";
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [cacheGeneratedAt, setCacheGeneratedAt] = useState<string | null>(null);
  const tickRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  // --- Throttle / re-click protection ---------------------------------------
  // Minimum time (ms) between two real download triggers. Within this window,
  // additional clicks reuse the in-flight or just-finished result instead of
  // launching a new generation.
  const COOLDOWN_MS = 8000;
  const lastTriggerRef = useRef<number>(0);
  const inFlightRef = useRef<Promise<Blob> | null>(null);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [throttleNotice, setThrottleNotice] = useState<string | null>(null);
  const cooldownTickRef = useRef<number | null>(null);

  const startCooldown = (ms: number) => {
    setCooldownLeft(Math.ceil(ms / 1000));
    if (cooldownTickRef.current !== null) {
      window.clearInterval(cooldownTickRef.current);
    }
    const startedAt = Date.now();
    cooldownTickRef.current = window.setInterval(() => {
      const remain = ms - (Date.now() - startedAt);
      if (remain <= 0) {
        setCooldownLeft(0);
        if (cooldownTickRef.current !== null) {
          window.clearInterval(cooldownTickRef.current);
          cooldownTickRef.current = null;
        }
      } else {
        setCooldownLeft(Math.ceil(remain / 1000));
      }
    }, 250);
  };


  // Cleanup blob URL on unmount or when a new download starts.
  useEffect(() => {
    return () => {
      if (readyBlobUrl) URL.revokeObjectURL(readyBlobUrl);
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
      if (cooldownTickRef.current !== null) window.clearInterval(cooldownTickRef.current);
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
    setErrorDetail(null);
    setCacheStatus(null);
    setCacheGeneratedAt(null);
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

  const fetchPdfWithProgress = async (signal: AbortSignal): Promise<Blob> => {
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
      signal,
    });
    if (!res.ok) {
      // Try to read the error body for richer diagnostics (truncated to 300 chars).
      let bodyText: string | undefined;
      try {
        const raw = await res.text();
        bodyText = raw ? raw.slice(0, 300) : undefined;
      } catch {
        /* ignore */
      }
      const retryAfterRaw = res.headers.get("retry-after");
      const retryAfter = retryAfterRaw ? Number(retryAfterRaw) : null;
      throw new PdfHttpError(
        res.status,
        res.statusText,
        bodyText,
        Number.isFinite(retryAfter) ? retryAfter : null,
      );
    }

    // Capture cache diagnostics (exposed via Access-Control-Expose-Headers).
    const cacheHeader = (res.headers.get("x-pdf-cache") || "").toUpperCase();
    if (cacheHeader) {
      setCacheStatus(
        (["HIT", "MISS", "REVALIDATED", "FALLBACK"].includes(cacheHeader)
          ? cacheHeader
          : "UNKNOWN") as CacheStatus,
      );
    }
    const generatedAt = res.headers.get("x-pdf-generated-at");
    if (generatedAt) setCacheGeneratedAt(generatedAt);

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
    readerRef.current = reader;
    const onAbort = () => {
      // Cancel the underlying stream so the network request stops immediately.
      reader.cancel("user-cancelled").catch(() => undefined);
    };
    signal.addEventListener("abort", onAbort);

    const chunks: Uint8Array[] = [];
    let received = 0;
    let firstChunk = true;

    try {
      while (true) {
        if (signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
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
    } finally {
      signal.removeEventListener("abort", onAbort);
      readerRef.current = null;
    }

    setProgress(100);
    return new Blob(chunks as BlobPart[], { type: "application/pdf" });
  };

  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.cancel("user-cancelled").catch(() => undefined);
      readerRef.current = null;
    }
    stopGenerationTicker();
    resetProgress();
    setStage("idle");
    setLoading(false);
    setErrorMsg(null);
  };

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!dynamicFunctionName) return; // let the <a href> default action run
    e.preventDefault();

    // --- Re-click guards ---------------------------------------------------
    // 1) A generation is currently in flight → just surface its status,
    //    don't queue or restart it.
    if (inFlightRef.current || loading) {
      setThrottleNotice(
        'Generierung läuft bereits – bitte warten oder „Abbrechen“ verwenden.',
      );
      window.setTimeout(() => setThrottleNotice(null), 4000);
      return;
    }

    // 2) Cooldown after a recent successful run → re-use the existing blob
    //    instead of re-triggering the edge function.
    const sinceLast = Date.now() - lastTriggerRef.current;
    if (sinceLast < COOLDOWN_MS) {
      const waitMs = COOLDOWN_MS - sinceLast;
      const waitSec = Math.ceil(waitMs / 1000);
      if (readyBlobUrl) {
        setThrottleNotice(
          `Letzter Download war gerade eben – aktuelle Version wird wiederverwendet (neue Erzeugung in ${waitSec}s möglich).`,
        );
        // Re-open the preview / re-trigger the browser save with the cached blob.
        setPreviewOpen(true);
      } else {
        setThrottleNotice(
          `Bitte ${waitSec}s warten, bevor erneut generiert werden kann.`,
        );
      }
      startCooldown(waitMs);
      window.setTimeout(() => setThrottleNotice(null), 4000);
      return;
    }

    setThrottleNotice(null);
    resetProgress();
    setLoading(true);
    setStage("connecting");
    lastTriggerRef.current = Date.now();
    const controller = new AbortController();
    abortRef.current = controller;

    const run = async (): Promise<Blob> => {
      try {
        return await fetchPdfWithProgress(controller.signal);
      } catch (streamErr) {
        if (controller.signal.aborted) throw streamErr;
        // Fallback to supabase-js if the direct fetch failed (e.g. CORS).
        console.warn("Streaming fetch failed, retrying via supabase-js:", streamErr);
        stopGenerationTicker();
        setStage("generating");
        setProgress(50);
        const { data, error } = await supabase.functions.invoke(
          dynamicFunctionName,
          { method: "GET" },
        );
        if (controller.signal.aborted) throw new DOMException("Aborted", "AbortError");
        if (error) throw error;
        const fallbackBlob =
          data instanceof Blob
            ? data
            : new Blob([data as ArrayBuffer], { type: "application/pdf" });
        setProgress(100);
        return fallbackBlob;
      }
    };

    inFlightRef.current = run();
    try {
      const blob = await inFlightRef.current;
      if (!blob.size) throw new Error("PDF leer (0 Bytes)");

      // Build a downloadable URL and surface it as a persistent link.
      const objectUrl = URL.createObjectURL(blob);
      setReadyBlobUrl(objectUrl);
      setBytesTotal(blob.size);
      setBytesReceived(blob.size);
      setStage("ready");

      // Show preview modal first; user triggers the actual save from there.
      setPreviewOpen(true);
      // Start cooldown only after a successful run.
      startCooldown(COOLDOWN_MS);
    } catch (err) {
      stopGenerationTicker();
      const isAbort =
        (err instanceof DOMException && err.name === "AbortError") ||
        controller.signal.aborted;
      if (isAbort) {
        console.info("PDF-Generierung vom Nutzer abgebrochen.");
        // No cooldown on cancel — let the user retry immediately.
        lastTriggerRef.current = 0;
        return;
      }
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
      inFlightRef.current = null;
      if (abortRef.current === controller) abortRef.current = null;
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
          aria-disabled={loading || cooldownLeft > 0}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          {loading
            ? "PDF wird erzeugt …"
            : cooldownLeft > 0
            ? `Bitte warten (${cooldownLeft}s) …`
            : (children ?? "Handbuch als PDF herunterladen")}
        </a>
      </Button>

      {throttleNotice && (
        <div
          role="status"
          aria-live="polite"
          className="inline-flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300"
        >
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{throttleNotice}</span>
        </div>
      )}

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
          <div className="mt-1.5 flex items-center justify-between gap-2">
            {(bytesReceived > 0 || bytesTotal) ? (
              <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
                {formatSize(bytesReceived)}
                {bytesTotal ? ` / ${formatSize(bytesTotal)}` : ""}
              </p>
            ) : (
              <span />
            )}
            {loading && stage !== "ready" && stage !== "error" && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-destructive"
                onClick={handleCancel}
              >
                <X className="h-3 w-3" />
                Abbrechen
              </Button>
            )}
          </div>
          {stage === "ready" && cacheStatus && (
            <div className="mt-2 pt-2 border-t flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
              <span className="text-muted-foreground">Cache:</span>
              <span
                className={
                  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono font-medium " +
                  (cacheStatus === "HIT"
                    ? "bg-primary/15 text-primary"
                    : cacheStatus === "MISS"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : cacheStatus === "REVALIDATED"
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    : cacheStatus === "FALLBACK"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-muted text-muted-foreground")
                }
                title={
                  cacheStatus === "HIT"
                    ? "Aus dem Server-Cache geliefert (keine Neuerzeugung)."
                    : cacheStatus === "MISS"
                    ? "Frisch erzeugt – Inhalt hatte sich geändert oder war nicht im Cache."
                    : cacheStatus === "REVALIDATED"
                    ? "Browser-Cache war noch gültig (304)."
                    : cacheStatus === "FALLBACK"
                    ? "Letzte erfolgreiche Version aus dem Fallback-Cache."
                    : "Cache-Status unbekannt."
                }
              >
                {cacheStatus}
              </span>
              <span className="text-muted-foreground">
                {cacheStatus === "HIT"
                  ? "aus Cache geliefert"
                  : cacheStatus === "MISS"
                  ? "neu erzeugt"
                  : cacheStatus === "REVALIDATED"
                  ? "unverändert (304)"
                  : cacheStatus === "FALLBACK"
                  ? "Fallback verwendet"
                  : "Status unbekannt"}
              </span>
              {cacheGeneratedAt && (
                <span className="text-muted-foreground/80">
                  · erstellt {formatDate(cacheGeneratedAt)}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {stage === "ready" && readyBlobUrl && (
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <Button
            type="button"
            size="sm"
            variant="default"
            className="gap-2"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-4 w-4" />
            Vorschau ansehen
          </Button>
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

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-3">
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              PDF-Vorschau bereit
            </DialogTitle>
            <DialogDescription>
              Prüfen Sie das Handbuch hier im Browser. Speichern oder in einem
              neuen Tab öffnen, sobald Sie zufrieden sind.
              {bytesTotal ? ` (${formatSize(bytesTotal)})` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/30 border-y">
            {readyBlobUrl ? (
              <iframe
                src={readyBlobUrl}
                title="Handbuch PDF Vorschau"
                className="w-full h-[70vh] bg-background"
              />
            ) : (
              <div className="h-[70vh] flex items-center justify-center text-muted-foreground text-sm">
                Vorschau nicht verfügbar.
              </div>
            )}
          </div>
          <DialogFooter className="px-6 py-4 sm:justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPreviewOpen(false)}
            >
              Schließen
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              {readyBlobUrl && (
                <Button asChild variant="outline" className="gap-2">
                  <a
                    href={readyBlobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    In neuem Tab
                  </a>
                </Button>
              )}
              {readyBlobUrl && (
                <Button asChild className="gap-2">
                  <a href={readyBlobUrl} download={fileName}>
                    <Download className="h-4 w-4" />
                    Jetzt speichern
                  </a>
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>


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
