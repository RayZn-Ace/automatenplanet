import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { HandbuchBlock, HandbuchSection } from "@/data/handbuchBoxautomat";

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
          {visibleSections.map(({ section }) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="text-foreground/60 mr-1">{section.number}.</span>
                {section.icon ? `${section.icon} ` : ""}
                {section.title}
              </a>
            </li>
          ))}
          {visibleExtras.map(({ entry }) => (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="text-foreground/60 mr-1">{entry.icon}</span>
                {entry.label}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
};

export default HandbuchTableOfContents;
