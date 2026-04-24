import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { HandbuchBlock, HandbuchSection } from "@/data/handbuchBoxautomat";
import { cn } from "@/lib/utils";

/**
 * Scroll-spy: returns the id of the section heading currently closest to the
 * top of the viewport (just below the sticky navbar). Uses IntersectionObserver
 * with a top-biased rootMargin so a section becomes "active" as soon as its
 * heading scrolls past the navbar — not only when it's centered.
 */
const useActiveSection = (ids: string[]): string | null => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || ids.length === 0) return;

    // Track which observed elements are currently intersecting the
    // top-of-viewport band defined by rootMargin.
    const visible = new Map<string, IntersectionObserverEntry>();

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const recompute = () => {
      if (visible.size === 0) {
        // Nothing in the band → keep whatever is closest above the navbar.
        // Find the last section whose top is above the trigger line.
        const triggerY = 140; // ~ navbar height + small offset
        let candidate: string | null = null;
        for (const el of elements) {
          const top = el.getBoundingClientRect().top;
          if (top - triggerY <= 0) candidate = el.id;
          else break;
        }
        setActiveId((prev) => (prev === candidate ? prev : candidate));
        return;
      }
      // Pick the visible entry whose top is highest (closest to the trigger
      // line). That's the section the reader is currently in.
      let best: IntersectionObserverEntry | null = null;
      for (const entry of visible.values()) {
        if (!best || entry.boundingClientRect.top < best.boundingClientRect.top) {
          best = entry;
        }
      }
      const nextId = best?.target.id ?? null;
      setActiveId((prev) => (prev === nextId ? prev : nextId));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry);
          } else {
            visible.delete(entry.target.id);
          }
        }
        recompute();
      },
      {
        // Activate when the heading enters the band between ~120px from the
        // top (just under the sticky navbar) and 60% from the top. This
        // matches the user's reading focus area.
        rootMargin: "-120px 0px -40% 0px",
        threshold: [0, 1],
      },
    );

    for (const el of elements) observer.observe(el);

    // Run once on mount in case the page is loaded mid-scroll (e.g. via
    // anchor link or browser back/forward).
    recompute();
    // Also recompute on scroll as a fallback for the "nothing visible" case.
    const onScroll = () => {
      if (visible.size === 0) recompute();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids]);

  return activeId;
};

type ExtraEntry = {
  id: string;
  icon: string;
  label: string;
  /** Extra keywords used as search haystack (besides the label). */
  keywords?: string;
};

type Props = {
  sections: HandbuchSection[];
  extraEntries: ExtraEntry[];
};

/**
 * Flattens a section's blocks into a single lowercase string used as the
 * search haystack. Lets users find sections by content keywords (e.g.
 * "Münzprüfer", "RGB", "Display") not just by chapter title.
 */
const buildSectionHaystack = (section: HandbuchSection): string => {
  const parts: string[] = [section.title];
  for (const block of section.blocks) {
    parts.push(blockToText(block));
  }
  return parts.join(" ").toLowerCase();
};

const blockToText = (block: HandbuchBlock): string => {
  switch (block.type) {
    case "paragraph":
    case "subheading":
      return block.text;
    case "list":
      return block.items.join(" ");
    case "callout":
      return [block.title ?? "", ...block.lines].join(" ");
    case "table":
      return block.rows.map((r) => `${r.label} ${r.value}`).join(" ");
    case "image":
      return [block.alt, block.caption ?? ""].join(" ");
    default:
      return "";
  }
};

const HandbuchTableOfContents = ({ sections, extraEntries }: Props) => {
  const [query, setQuery] = useState("");

  // Pre-compute haystacks once per render; cheap because content is static.
  const sectionIndex = useMemo(
    () =>
      sections.map((section) => ({
        section,
        haystack: buildSectionHaystack(section),
      })),
    [sections],
  );

  const extraIndex = useMemo(
    () =>
      extraEntries.map((entry) => ({
        entry,
        haystack: `${entry.label} ${entry.keywords ?? ""}`.toLowerCase(),
      })),
    [extraEntries],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const visibleSections = isSearching
    ? sectionIndex.filter((item) => item.haystack.includes(normalizedQuery))
    : sectionIndex;

  const visibleExtras = isSearching
    ? extraIndex.filter((item) => item.haystack.includes(normalizedQuery))
    : extraIndex;

  const totalVisible = visibleSections.length + visibleExtras.length;

  // Scroll-spy across all anchors shown in the TOC (sections + extras).
  const allIds = useMemo(
    () => [...sections.map((s) => s.id), ...extraEntries.map((e) => e.id)],
    [sections, extraEntries],
  );
  const activeId = useActiveSection(allIds);

  const linkBase =
    "block py-0.5 px-2 -mx-2 rounded transition-colors border-l-2";
  const linkInactive =
    "border-transparent text-muted-foreground hover:text-primary";
  const linkActive =
    "border-primary text-primary font-medium bg-primary/5";

  return (
    <nav
      aria-label="Inhaltsübersicht"
      className="mb-10 rounded-lg border border-white/10 bg-white/5 p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-sm uppercase tracking-widest text-primary">
          Inhaltsübersicht
        </h2>
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="handbuch-toc-search" className="sr-only">
            Inhaltsverzeichnis durchsuchen
          </label>
          <input
            id="handbuch-toc-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche z. B. Sicherheit, Fehler …"
            className="w-full h-9 rounded-md bg-background/60 border border-white/10 pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition"
            aria-describedby="handbuch-toc-search-status"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 flex items-center justify-center transition"
              aria-label="Suche zurücksetzen"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <p
        id="handbuch-toc-search-status"
        className="sr-only"
        role="status"
        aria-live="polite"
      >
        {isSearching
          ? `${totalVisible} Treffer für „${query}“.`
          : `${totalVisible} Kapitel verfügbar.`}
      </p>

      {totalVisible === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          Keine Treffer für „{query}“. Versuche einen anderen Begriff wie
          „Wartung“, „Münzprüfer“ oder „Display“.
        </p>
      ) : (
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 list-none pl-0 text-sm">
          {visibleSections.map(({ section }) => {
            const isActive = section.id === activeId;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(linkBase, isActive ? linkActive : linkInactive)}
                >
                  <span className={cn("mr-1", isActive ? "text-primary/80" : "text-foreground/60")}>
                    {section.number}.
                  </span>
                  {section.icon ? `${section.icon} ` : ""}
                  {section.title}
                </a>
              </li>
            );
          })}
          {visibleExtras.map(({ entry }) => {
            const isActive = entry.id === activeId;
            return (
              <li key={entry.id}>
                <a
                  href={`#${entry.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(linkBase, isActive ? linkActive : linkInactive)}
                >
                  <span className={cn("mr-1", isActive ? "text-primary/80" : "text-foreground/60")}>
                    {entry.icon}
                  </span>
                  {entry.label}
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
};

export default HandbuchTableOfContents;
