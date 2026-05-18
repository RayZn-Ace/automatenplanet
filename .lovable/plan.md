# Self-hosted Analytics Dashboard

Eigenes, datenschutzfreundliches Tracking + passwortgeschütztes Dashboard unter `/metriken`. Keine Drittanbieter, IP gehasht, sessionStorage statt Cookies. Daten landen in Lovable Cloud (Supabase), Aggregation per SQL.

## Architektur

```text
Browser (jeder Besucher)
   │  sendBeacon JSON
   ▼
Edge Function: track-event  (public, rate-limited)
   │  INSERT
   ▼
Tabelle: analytics_events  (append-only)
   ▲
   │  SELECT (aggregiert)
Edge Function: analytics-dashboard  (auth + admin-Check)
   ▲
   │
Dashboard /metriken  (React, Recharts, Supabase Auth Login)
```

## Datenmodell

Tabelle `analytics_events` (single source of truth):
- `id`, `session_id (uuid)`, `page_id`, `event_type`
- `device_type`, `browser`, `referrer`, `utm_source/medium/campaign`
- `duration_ms`, `question_id`, `question_title`, `answer_option`
- `value_cents`, `currency` (für Käufe)
- `ip_hash` (SHA-256), `created_at`
- Indizes auf `(created_at)` und `(session_id)`
- RLS: nur INSERT via service-role (Edge Function), SELECT nur für admin-Rolle

Rollen-System nach Lovable-Standard:
- `app_role` Enum (`admin`, `user`)
- `user_roles` Tabelle + `has_role()` Security-Definer-Funktion
- Admin manuell per SQL gesetzt nach erster Registrierung

## Tracking-Client

`src/lib/analytics.ts` (~60 Zeilen):
- `getSessionId()` → UUID in `sessionStorage`
- `track(eventType, payload)` → `navigator.sendBeacon` an Edge Function
- `trackPageview(pageId)` → pageview + automatisches `page_exit` mit duration

Integration in `App.tsx` per Route-Change-Hook. Zusätzlich Events für:
- `product_viewed` auf Produktseiten
- `add_to_cart` im CartStore
- `checkout_started` beim Klick auf "Zur Kasse"
- `whatsapp_click`, `phone_click`, `contact_form_submit`

## Edge Functions

**`track-event`** (public, `verify_jwt = false`):
- Validiert Body (zod)
- Parsed User-Agent → device + browser
- Hashed IP via SHA-256
- INSERT via service-role-Client
- Returns 204

**`analytics-dashboard`** (auth required):
- Validiert JWT via `getClaims()`
- Prüft `has_role(user_id, 'admin')`
- Liest `from`/`to` aus Query
- Führt 5 Aggregate-Queries parallel aus (`Promise.all`)
- Returns: `{ totals, pageStats, deviceBreakdown, dailySeries, topEvents }`

## Dashboard UI

Route `/metriken` (passwortgeschützt):
- Wenn nicht eingeloggt → Login-Form (Email + Passwort, Supabase Auth)
- Wenn eingeloggt, aber kein admin → "Kein Zugriff"
- Sonst: Dashboard mit
  - Topbar: Datumsbereich-Picker (Heute, 7T, 30T, Custom) + Live-Toggle
  - KPI-Cards: Besucher, Käufe, Conversion-Rate
  - LineChart Besucher pro Tag
  - BarChart Device-Split
  - BarChart Top-Seiten mit avg. Verweildauer
  - Liste Top-Produkte (aus `product_viewed`)
  - Liste Top-Add-to-Cart
- Auto-Refresh alle 30s wenn Live an
- Locale `de-DE` für alle Zahlen
- Recharts, Tailwind, bestehende Design-Tokens

## Sicherheit

- Public Ingest: Rate-Limit über simplen In-Memory-Counter pro IP-Hash (60/min)
- IP wird nur gehasht gespeichert, nie roh
- Dashboard-Endpoint prüft Admin-Rolle server-side
- Alle Queries parametrisiert (Supabase Client)
- Dashboard-Route nicht in `sitemap.xml`, `noindex` Meta

## Reihenfolge der Schritte

1. Migration: `analytics_events` Tabelle, `app_role` Enum, `user_roles`, `has_role()` Funktion, RLS
2. Edge Function `track-event` + Deploy
3. Edge Function `analytics-dashboard` + Deploy
4. `src/lib/analytics.ts` Client
5. Integration in `App.tsx`, `ProductPage`, `CartStore`, `BoxautomatLanding`
6. `/metriken` Seite mit Login + Dashboard
7. Recharts installieren
8. Admin-User: nach erster Registrierung manuell `user_roles` Eintrag setzen

## Was du nach Deployment selber machst

1. Auf `/metriken` gehen → Account registrieren (deine Email)
2. Mir die User-ID nennen → ich setze dich per SQL als Admin
3. Fertig

## Was ich brauche von dir vorab

Nichts. Lovable Cloud ist schon aktiv, Auth läuft auf Supabase, Edge Functions deployen automatisch.
