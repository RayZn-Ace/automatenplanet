// Schreibt den Google-Merchant-Feed beim Build auf die schöne Adresse
// https://automatplanet.de/produktfeed.xml
//
// Hintergrund: Das Hosting liefert statische Dateien aus, eine echte
// Server-Weiterleitung auf die Edge-Function ist dort nicht möglich. Daher
// holen wir den Feed beim Build einmal von der Edge-Function ab und legen ihn
// als dist/produktfeed.xml ab. Die Edge-Function bleibt die lebende Quelle
// (immer tagesaktuell) – wer sie direkt möchte, kann sie weiter abrufen.
//
// Wenn der Abruf fehlschlägt, bricht der Build NICHT ab: es wird eine
// Weiterleitungs-Seite geschrieben, die auf die Edge-Function zeigt.

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

const DIST = resolve("dist");
const OUT = resolve(DIST, "produktfeed.xml");

const projectId = process.env.VITE_SUPABASE_PROJECT_ID;
const supabaseUrl = process.env.VITE_SUPABASE_URL ?? (projectId ? `https://${projectId}.supabase.co` : "");
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

async function main() {
  if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true });

  if (!supabaseUrl) {
    console.warn("[product-feed] Keine Backend-URL im Build-Env – produktfeed.xml wird übersprungen.");
    return;
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/product-feed`;

  try {
    const res = await fetch(endpoint, {
      headers: anonKey ? { apikey: anonKey, Authorization: `Bearer ${anonKey}` } : {},
    });
    const xml = await res.text();
    if (!res.ok || !xml.includes("<rss")) {
      throw new Error(`HTTP ${res.status}`);
    }
    writeFileSync(OUT, xml, "utf8");
    const count = (xml.match(/<item>/g) ?? []).length;
    console.log(`[product-feed] dist/produktfeed.xml geschrieben (${count} Angebote).`);
  } catch (error) {
    console.warn(`[product-feed] Abruf fehlgeschlagen (${String(error)}) – schreibe Verweis-Datei.`);
    writeFileSync(
      OUT,
      `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Live-Feed: ${endpoint} -->\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n  <channel>\n    <title>Automatplanet Produktfeed</title>\n    <link>https://automatplanet.de</link>\n    <description>Feed temporaer nicht verfuegbar. Live-Quelle: ${endpoint}</description>\n  </channel>\n</rss>\n`,
      "utf8",
    );
  }
}

main();
