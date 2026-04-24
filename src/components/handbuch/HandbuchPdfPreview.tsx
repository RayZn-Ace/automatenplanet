import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface HandbuchPdfPreviewProps {
  /** Edge function name that renders the PDF on demand. */
  functionName?: string;
  /** Static fallback URL if the edge function fails. */
  fallbackUrl?: string;
  /** Suggested filename for the download. */
  fileName?: string;
  /** Initial viewer height in pixels. */
  height?: number;
}

interface PreviewMeta {
  contentHash: string | null;
  expectedHash: string | null;
  inSync: boolean | null;
  version: string | null;
  generatedAt: string | null;
  syncedAt: string | null;
  sizeBytes: number;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("de-DE", {
      dateStyle: "long",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

/**
 * In-page PDF preview for the Boxautomat handbook.
 *
 * Calls the `generate-handbuch-pdf` edge function, builds an object URL from
 * the returned blob, and embeds it in an <iframe> using the browser's
 * built-in PDF viewer. Surfaces the version metadata + drift status returned
 * by the function so editors can immediately verify the document.
 */
const HandbuchPdfPreview = ({
  functionName = "generate-handbuch-pdf",
  fallbackUrl = "/downloads/handbuch-boxautomat.pdf",
  fileName = "handbuch-boxautomat.pdf",
  height = 720,
}: HandbuchPdfPreviewProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [meta, setMeta] = useState<PreviewMeta | null>(null);
  const lastUrlRef = useRef<string | null>(null);

  const revokePrev = useCallback(() => {
    if (lastUrlRef.current) {
      URL.revokeObjectURL(lastUrlRef.current);
      lastUrlRef.current = null;
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    // 1) Try the edge function first (always renders fresh from current text)
    try {
      // Use fetch directly so we can read response headers (drift metadata).
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const url = `${supabaseUrl}/functions/v1/${functionName}`;

      const res = await fetch(url, {
        method: "GET",
        headers: anonKey
          ? { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
          : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      if (!blob.size) throw new Error("Leeres PDF (0 Bytes)");

      revokePrev();
      const obj = URL.createObjectURL(blob);
      lastUrlRef.current = obj;
      setObjectUrl(obj);

      const inSyncHeader = res.headers.get("x-pdf-in-sync");
      setMeta({
        contentHash: res.headers.get("x-pdf-content-hash"),
        expectedHash: res.headers.get("x-pdf-expected-hash"),
        inSync:
          inSyncHeader === null ? null : inSyncHeader.toLowerCase() === "true",
        version: res.headers.get("x-pdf-version"),
        generatedAt: res.headers.get("x-pdf-generated-at"),
        syncedAt: res.headers.get("x-pdf-synced-at"),
        sizeBytes: blob.size,
      });
      // Suppress unused-var lint when projectId is referenced for debugging.
      void projectId;
      return;
    } catch (err) {
      // Fall through to static fallback below
      console.warn("Edge preview failed, trying static fallback:", err);
    }

    // 2) Static fallback (last build's PDF)
    try {
      const res = await fetch(fallbackUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      if (!blob.size) throw new Error("Leeres PDF (0 Bytes)");
      revokePrev();
      const obj = URL.createObjectURL(blob);
      lastUrlRef.current = obj;
      setObjectUrl(obj);
      setUsingFallback(true);
      setMeta({
        contentHash: null,
        expectedHash: null,
        inSync: null,
        version: null,
        generatedAt: null,
        syncedAt: null,
        sizeBytes: blob.size,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Vorschau konnte nicht geladen werden: ${msg}`);
      setObjectUrl(null);
    } finally {
      setLoading(false);
    }
  }, [functionName, fallbackUrl, revokePrev]);

  useEffect(() => {
    load();
    return () => revokePrev();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = () => {
    if (!objectUrl) return;
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    if (!objectUrl) return;
    window.open(objectUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="pdf-vorschau"
      aria-labelledby="pdf-vorschau-heading"
      className="scroll-mt-28 mt-12 rounded-lg border border-white/10 bg-white/5 p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2
            id="pdf-vorschau-heading"
            className="text-2xl font-semibold text-foreground flex items-center gap-2"
          >
            <Eye className="h-6 w-6 text-primary" aria-hidden="true" />
            PDF Vorschau
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Wird live aus dem aktuellen Seiteninhalt erzeugt – ideal zur
            sofortigen Kontrolle vor dem Download.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={load}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Neu laden
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenNewTab}
            disabled={!objectUrl}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Neuer Tab
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDownload}
            disabled={!objectUrl}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Herunterladen
          </Button>
        </div>
      </header>

      {/* Status row */}
      {meta && !error && (
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {meta.inSync === true && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              synchron mit Build
            </span>
          )}
          {meta.inSync === false && (
            <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              Drift erkannt
            </span>
          )}
          {usingFallback && (
            <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              Statischer Fallback
            </span>
          )}
          {meta.version && (
            <span>
              v<strong className="text-foreground">{meta.version}</strong>
            </span>
          )}
          {meta.contentHash && (
            <span title="Hash über den Seiteninhalt">
              Inhalt&nbsp;
              <code className="font-mono text-foreground/80">
                {meta.contentHash}
              </code>
            </span>
          )}
          {meta.generatedAt && (
            <span>
              erzeugt{" "}
              <time dateTime={meta.generatedAt} className="text-foreground">
                {formatDate(meta.generatedAt)}
              </time>
            </span>
          )}
          <span>{formatSize(meta.sizeBytes)}</span>
        </div>
      )}

      {/* Viewer */}
      <div
        className="relative w-full overflow-hidden rounded-md border border-white/10 bg-white"
        style={{ height }}
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur-sm text-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm">PDF wird live erzeugt …</p>
          </div>
        )}

        {error && !loading && (
          <div
            role="alert"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-destructive bg-destructive/5"
          >
            <AlertTriangle className="h-8 w-8" />
            <p className="text-sm font-medium">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={load}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Erneut versuchen
            </Button>
          </div>
        )}

        {objectUrl && !error && (
          <iframe
            key={objectUrl}
            src={`${objectUrl}#view=FitH&toolbar=1`}
            title="Vorschau Boxautomat Handbuch (PDF)"
            className="h-full w-full border-0"
          />
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Hinweis: Die Vorschau nutzt den eingebauten PDF-Viewer deines Browsers.
        Auf manchen mobilen Browsern ist die Inline-Anzeige eingeschränkt –
        in dem Fall öffne das PDF über „Neuer Tab".
      </p>
    </section>
  );
};

export default HandbuchPdfPreview;
