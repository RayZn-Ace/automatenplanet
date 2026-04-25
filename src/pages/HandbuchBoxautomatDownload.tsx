import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

/**
 * On-demand PDF download endpoint.
 *
 * Route: `/downloads/handbuch-boxautomat`
 *
 * Why not `/downloads/handbuch-boxautomat.pdf`?
 *   That path is served by the static hosting layer (the file in
 *   `public/downloads/handbuch-boxautomat.pdf`) and would never reach the
 *   React router. Using a `.pdf`-less path lets the SPA take over and call
 *   the `generate-handbuch-pdf` edge function fresh on every visit.
 *
 * Behavior:
 *   1. On mount, invoke the edge function to render the PDF on demand.
 *   2. Display the result inline in an <iframe> (so the user can preview it).
 *   3. Trigger an automatic browser download with the canonical filename.
 *   4. On failure, fall back to the static `/downloads/handbuch-boxautomat.pdf`.
 */
const FILE_NAME = "handbuch-boxautomat.pdf";
const STATIC_FALLBACK = "/downloads/handbuch-boxautomat.pdf";
const FUNCTION_NAME = "generate-handbuch-pdf";

const HandbuchBoxautomatDownload = () => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let createdUrl: string | null = null;

    (async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          FUNCTION_NAME,
          { method: "GET" },
        );
        if (fnError) throw fnError;

        const blob =
          data instanceof Blob
            ? data
            : new Blob([data as ArrayBuffer], { type: "application/pdf" });
        if (!blob.size) throw new Error("PDF leer (0 Bytes)");

        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);

        // Auto-trigger browser download.
        const a = document.createElement("a");
        a.href = createdUrl;
        a.download = FILE_NAME;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error("On-demand PDF generation failed:", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unbekannter Fehler",
          );
          // Hard fallback: navigate to the static file.
          window.location.replace(STATIC_FALLBACK);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Handbuch Boxautomat – PDF wird erzeugt</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-6">
          {loading && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <h1 className="text-2xl font-bold">PDF wird erzeugt …</h1>
              <p className="text-muted-foreground">
                Das Boxautomat-Handbuch wird gerade live aus dem aktuellen
                Inhalt generiert. Der Download startet automatisch.
              </p>
            </>
          )}

          {!loading && blobUrl && (
            <>
              <Download className="h-12 w-12 mx-auto text-primary" />
              <h1 className="text-2xl font-bold">Download bereit</h1>
              <p className="text-muted-foreground">
                Falls der Download nicht automatisch startete, klicken Sie
                hier:
              </p>
              <Button asChild size="lg" className="gap-2">
                <a href={blobUrl} download={FILE_NAME}>
                  <Download className="h-5 w-5" />
                  {FILE_NAME} herunterladen
                </a>
              </Button>
              <iframe
                src={blobUrl}
                title="Handbuch Boxautomat Vorschau"
                className="w-full h-[70vh] mt-6 rounded-md border"
              />
            </>
          )}

          {!loading && error && (
            <div
              role="alert"
              className="inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertTriangle className="h-5 w-5" />
              Fehler bei der PDF-Erzeugung – wir leiten Sie zur statischen
              Version weiter …
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default HandbuchBoxautomatDownload;
