
# Startseite v2: Slider, Aufräumen, Nav-Fix

Vier kleine, klar abgegrenzte Änderungen — nur Startseite + Navbar.

## 1. „Alle Automaten" in der Navbar reparieren

Aktuell zeigt der Link auf `/#produkte`, aber diese Section gibt es nicht mehr (wurde mit der `Products`-Section entfernt). Lösung: Die neue Slider-Section unter den beiden Highlights bekommt `id="produkte"`. Damit funktioniert der Anker auf der Startseite und das Routing-Verhalten von Unterseiten aus (`/#produkte`) wieder wie erwartet.

## 2. Neuer Produkt-Slider unter den Highlights

Direkt unter `Greifautomat – Der Klassiker für jeden Standort` kommt eine neue Section `MoreProductsSlider` mit `id="produkte"`:

- Zeigt alle Produkte aus `src/data/products.ts` **außer** Boxautomat Premium und Greifautomat (die sind bereits oben prominent).
- Horizontaler Slider auf Basis der vorhandenen shadcn-`Carousel`-Komponente (Embla) mit sichtbaren Pfeil-Buttons links/rechts.
- Karten-Design analog zur bisherigen `Products.tsx` (großes Bild `object-contain`, Name, Preis, Link auf `/produkte/{slug}`), aber kompakter, sodass mehrere Karten gleichzeitig sichtbar sind:
  - mobil: 1.2 sichtbar
  - tablet: 2.5
  - desktop: 3.5–4
- Headline: „Weitere Automaten" mit kurzem Subtitle.
- Unter dem Slider ein dezenter Link „Alle Standorte ansehen → /standorte" entfällt — bleibt rein bei Produkten.

## 3. Sections von der Startseite entfernen

In `src/pages/Index.tsx`:

- `<Categories />` raus (Section „Unsere Automaten-Kategorien").
- `<Business />` raus (enthält Einnahmen-Kalkulator + „Ideale Standorte"). Falls die Standorte-Liste später noch gewünscht ist, kann sie separat wieder rein — jetzt erst mal komplett raus.

## 4. Doppelte Kundenstimmen aus dem Kontaktbereich entfernen

In `src/components/sections/Contact.tsx`: Der obere Block mit den Testimonials (Zeilen ~10–29 Daten + ~56–90 JSX) wird gelöscht. Übrig bleiben Kontaktformular, Schnellkontakt, Newsletter. Damit ist die einzige Testimonials-Section auf der Startseite die neue `HomeTestimonials` weiter oben.

## Resultierende Reihenfolge auf `/`

```text
Navbar
Hero
PhoneBanner
ProductHighlight  Boxautomat Premium
ProductHighlight  Greifautomat
MoreProductsSlider  (id="produkte")   ← NEU
Benefits
HomeTestimonials
Team
BlogPreview
Contact (ohne oberen Testimonial-Block)
SEOInfo
Footer
```

## Out of Scope

- Boxautomat-Landingpage, Produktseiten, Standorte, Blog, Footer.
- Farben, Tokens, sonstige Sections.
