import { useState, type ReactNode } from "react";
import { Link2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Props = {
  /** DOM id used for the in-page anchor (e.g. "fehlerbehebung"). */
  anchorId: string;
  /** Heading text/children. */
  children: ReactNode;
  /** Optional extra classes for the <h2>. */
  className?: string;
};

/**
 * A heading with a small "copy anchor link" button next to it. Hovering the
 * heading group reveals the button on desktop; on touch devices the button is
 * always visible. Clicking copies the absolute URL including the hash (e.g.
 * https://automatplanet.de/handbuch/boxautomat#fehlerbehebung) and updates
 * the address bar so the link can simply be shared from there too.
 */
const HandbuchAnchorHeading = ({ anchorId, children, className }: Props) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Build absolute URL so the copied link works when pasted anywhere, not
    // just within the current site.
    const base =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : "";
    const url = `${base}#${anchorId}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers / non-secure contexts.
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      // Reflect the anchor in the URL bar without triggering a jump.
      if (typeof window !== "undefined") {
        history.replaceState(null, "", `#${anchorId}`);
      }
      setCopied(true);
      toast({
        title: "Link kopiert",
        description: `#${anchorId} wurde in die Zwischenablage übernommen.`,
      });
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      toast({
        title: "Kopieren fehlgeschlagen",
        description: (err as Error).message || "Bitte erneut versuchen.",
        variant: "destructive",
      });
    }
  };

  return (
    <h2
      className={cn(
        "group/anchor flex items-center gap-2 text-2xl font-semibold text-foreground mb-3 scroll-mt-28",
        className,
      )}
    >
      <span className="min-w-0">{children}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Ankerlink #${anchorId} kopieren`}
        title={`#${anchorId} kopieren`}
        className={cn(
          "inline-flex items-center justify-center h-7 w-7 rounded-md",
          "text-muted-foreground hover:text-primary hover:bg-primary/10",
          "border border-transparent hover:border-primary/30",
          "transition-all",
          // Hidden until hover/focus on pointer devices, always visible on touch.
          "opacity-0 group-hover/anchor:opacity-100 focus-visible:opacity-100",
          "[@media(hover:none)]:opacity-100",
          copied && "opacity-100 text-primary border-primary/30 bg-primary/10",
        )}
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="sr-only">
          {copied ? "Link kopiert" : "Link kopieren"}
        </span>
      </button>
    </h2>
  );
};

export default HandbuchAnchorHeading;
