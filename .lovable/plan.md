
# Startseite & Navigation: Cleaner, klarer, fokussierter

Ziel: Die Startseite bekommt das gleiche ruhige, fokussierte Design wie die Boxautomat-Landingpage. Klar erkennbare Hierarchie: **Boxautomat zuerst, Greifautomat danach**, alles andere ist Beiwerk. Navigation funktioniert auch auf Unterseiten.

Nur die Startseite (`Index.tsx` + zugehörige Sections) und die `Navbar` werden angefasst. Boxautomat-Landing, Produktseiten, Blog etc. bleiben unverändert.

---

## 1. Startseite (`/`) – Sections aufräumen

**Neue Reihenfolge:**

```text
Navbar
Hero (überarbeitet, klarer)
PhoneBanner
[NEU] Hero-Produkt: Boxautomat   ← großes Showcase, CTA "Mehr erfahren"
[NEU] Hero-Produkt: Greifautomat ← zweites Showcase, etwas kleiner
Categories (gekürzt, mehr Bildanteil)
Benefits (verkürzt, im Stil der Box-Landing)
Testimonials (NEU – ersetzt aktuelle Kundenstimmen, Inhalte aus Box-Landing)
Business
Team
BlogPreview
Contact
Footer
```

**Entfernt von der Startseite:**
- `Products`-Grid (alle 6+ Produkte) – ersetzt durch zwei Hero-Showcases + Link "Alle Automaten".
- `ProductSlideshow` – redundant.
- `Media` – optional, kann bleiben oder weg (siehe offene Frage).
- `FAQ` – komplett raus.
- `SEOInfo` – bleibt (für SEO wichtig), aber visuell dezenter.
- Einnahmen-/ROI-Rechner ist auf der Startseite ohnehin nicht – nichts zu tun.

---

## 2. Neue Hero-Produkt-Sections (Box & Greif)

Inspiriert vom Boxautomat-Landing-Layout: großes Produktbild links/rechts, klarer Text, ein primärer CTA.

**Boxautomat-Showcase (`#1 Highlight`):**
- Großes Produktbild (`/images/products/boxing-machine-new.png`) mit etwas Glow/Schatten wie auf der Landing.
- Headline: „Unser Bestseller: Boxautomat Premium"
- 3 Bullet-Points (Einnahmen, Plug & Play, Versand 24 h).
- Preis ab 1.799 € netto.
- CTA: „Zum Boxautomat" → `/produkte/boxautomat-premium`.

**Greifautomat-Showcase (`#2`):**
- Gleiches Layout, gespiegelt.
- Produkt umbenennen: **„Claw Machine" → „Greifautomat"** (in `src/data/products.ts`, Feld `name`). `slug` bleibt `greifautomat`.
- Bild `/images/products/claw-machine-new.png`.
- Preis ab 2.499 € netto.
- CTA: „Zum Greifautomat" → `/produkte/greifautomat`.

Unter den beiden Showcases: kleiner Link „Alle Automaten ansehen →" zu `#produkte` bzw. zu einer simplen Übersichtssektion (kompakte Logo-/Mini-Grid statt großer Cards).

---

## 3. Testimonials austauschen

Neue Section `HomeTestimonials` (oder bestehende Kundenstimmen-Section ersetzen). Inhalte 1:1 aus dem `testimonials`-Array in `BoxautomatLanding.tsx` (Mehmet, Sarah, Thomas, Daniel, Aylin, Markus, Lisa, Kevin, Jasmin, Robert) – als saubere Karten/Grid wie auf der Landing-Page (gleiche Optik: Quote, Sterne, Verified-Badge).

Damit Wartung einfach bleibt: Testimonials-Array in `src/data/testimonials.ts` auslagern und sowohl von Startseite als auch Boxautomat-Landing importieren.

---

## 4. Hero & Categories cleaner

- **Hero**: Subline kürzen, nur ein primärer CTA („Boxautomat ansehen") + sekundärer („Beratung"). Weniger Text, mehr Luft.
- **Categories**: 6 → 4 Kacheln (Boxautomaten, Greifautomaten, Basketball, Event/Sonstige). Größere Bilder/Icons, weniger Text pro Kachel.
- **Benefits**: max. 4 Punkte, gleiches Icon-Layout wie auf der Landing.

Keine Änderung an Farben, Typo, Tokens – nur Inhalte/Anordnung.

---

## 5. Navbar shop-tauglich machen

Aktuelles Problem: Anker-Links (`#kategorien`, `#vorteile`, `#produkte`, `#business`, `#faq`) zeigen auf Sections der Startseite. Auf Unterseiten landet man dann auf `/#faq` und scrollt ggf. ins Leere, oder Links wie „FAQ" ergeben in einem Shop-Kontext keinen Sinn.

**Neue Navigationsstruktur (kontextunabhängig, funktioniert überall):**

```text
Logo | Boxautomat | Greifautomat | Alle Automaten | Standorte | Blog | Kontakt   [DE/EN] [Beratung] [Anfrage] [Cart]
```

- „Boxautomat" → `/produkte/boxautomat-premium`
- „Greifautomat" → `/produkte/greifautomat`
- „Alle Automaten" → `/#produkte` (auf Startseite scrollt es, sonst navigiert es dorthin – über den schon vorhandenen `hashHref`-Mechanismus, der weiter genutzt wird)
- „Standorte" → `/standorte`
- „Blog" → `/blog`
- „Kontakt" → `/#kontakt` (bleibt Anker, auf Startseite vorhanden)

Damit funktioniert das Menü auf jeder Unterseite sinnvoll. „Vorteile" und „FAQ" fliegen raus.

Mobile-Menü erbt dieselbe Struktur.

---

## 6. Datenmodell-Mini-Änderung

In `src/data/products.ts`:
- `name: "Claw Machine"` → `name: "Greifautomat"`.
- `metaTitle` / Beschreibung schon „Greifautomat"-konform – nichts weiter zu tun.
- Alle anderen Produkte und Slugs bleiben unverändert.

---

## Out of Scope

- Boxautomat-Landingpage (unverändert).
- Produktdetailseiten, Blog, Standorte, Handbuch.
- Checkout / Cart / Backend.
- Farben, Tokens, Tailwind-Konfig.

---

## Offene Fragen (kurz, vor der Umsetzung)

1. **`Media`-Section** (Presse-/Video-Bereich) auf der Startseite: behalten oder auch entfernen?
2. **Boxautomat oben in der Navbar**: als eigener prominenter Menüpunkt (wie geplant) oder lieber unauffälliger unter „Alle Automaten"?
3. Soll der Greifautomat-Slug `greifautomat` bleiben (URL `/produkte/greifautomat`)? Empfehlung: ja, ist bereits SEO-optimal.
