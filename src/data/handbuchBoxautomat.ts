/**
 * Single source of truth for the Boxautomat handbook.
 *
 * BOTH the React page (src/pages/HandbuchBoxautomat.tsx) AND the build-time
 * PDF generator (scripts/generate-handbuch-pdf.mjs) consume this file.
 * Edit the content here and the PDF is regenerated automatically on `bun run build`.
 */

export type HandbuchBlock =
  | { type: "paragraph"; text: string; emphasis?: boolean }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "subheading"; text: string }
  | { type: "callout"; variant: "info" | "warning"; title?: string; lines: string[] }
  | { type: "table"; rows: { label: string; value: string }[] };

export type HandbuchSection = {
  id: string;
  number: string;
  title: string;
  icon?: string;
  blocks: HandbuchBlock[];
};

export type HandbuchFaqItem = {
  question: string;
  answer: string;
};

export const HANDBUCH_BOXAUTOMAT_META = {
  title: "Boxautomat Handbuch – Box & Kick Maschine",
  subtitle: "Benutzerhandbuch",
  product: "Boxautomat – Box & Kick Maschine",
  articleNumber: "2025101",
  publisher: {
    name: "SMEA GmbH",
    address: "Kothöferdamm 7, 30177 Hannover",
    email: "kontakt@smea.info",
    website: "automatplanet.de",
  },
  url: "https://automatplanet.de/handbuch/boxautomat",
  pdfPath: "/downloads/handbuch-boxautomat.pdf",
  // Bumped whenever the textual content changes. Surfaces in the PDF footer.
  version: "1.0",
  lastUpdated: "2026-04-24",
};

export const HANDBUCH_BOXAUTOMAT_SECTIONS: HandbuchSection[] = [
  {
    id: "verwendungszweck",
    number: "1",
    title: "Verwendungszweck",
    blocks: [
      {
        type: "paragraph",
        text:
          "Der Boxautomat – auch als Box & Kick Maschine bekannt – ist ein professionelles Unterhaltungsgerät zur präzisen Messung der Schlag- und Trittkraft. Die robuste Box-Maschine wird in der Gastronomie, in Nachtclubs, in Bars und in Fitnessstudios eingesetzt und verbindet sportliche Herausforderung mit attraktivem Münzumsatz für den Betreiber.",
      },
      {
        type: "paragraph",
        text:
          "Diese Bedienungsanleitung beschreibt alle wichtigen Themen rund um den Boxautomaten: Aufbau und Inbetriebnahme, Wartung und Pflege, Reinigung des Münzprüfers, Wechsel des Schlagballs sowie typische Fehlerbehebung. So bleibt Ihre Box & Kick Maschine dauerhaft betriebsbereit.",
      },
      { type: "paragraph", text: "Das Gerät bietet zwei Spielmodi:", emphasis: true },
      {
        type: "list",
        items: [
          "Boxmodus → Messung der Schlagkraft",
          "Kickmodus → Messung der Trittkraft",
        ],
      },
      { type: "paragraph", text: "Einsatzbereiche:", emphasis: true },
      {
        type: "list",
        items: ["Nachtclubs", "Fitnessstudios", "Bars", "Freizeitbereiche"],
      },
      {
        type: "callout",
        variant: "info",
        lines: [
          "Das Gerät dient ausschließlich der Unterhaltung und ist kein medizinisches Messgerät.",
        ],
      },
    ],
  },
  {
    id: "sicherheit",
    number: "2",
    title: "Sicherheitshinweise",
    icon: "⚠️",
    blocks: [
      { type: "subheading", text: "Allgemeine Sicherheit" },
      {
        type: "list",
        items: [
          "Vorsicht beim Öffnen der Verpackung – Inhalt kann beschädigt sein",
          "Aufbau nur durch mindestens 2 Personen",
          "Weiche Unterlage beim Aufbau verwenden",
        ],
      },
      { type: "subheading", text: "Nutzung" },
      {
        type: "list",
        items: [
          "Kein Spielzeug – nicht für Kinder unter 36 Monaten geeignet",
          "Kinder nur unter Aufsicht spielen lassen",
          "Gerät nicht als Ablagefläche nutzen",
          "Nicht auf das Gerät klettern",
        ],
      },
      { type: "subheading", text: "Aufstellung" },
      {
        type: "list",
        items: [
          "Auf festen, ebenen Untergrund stellen",
          "Unebenheiten mit verstellbaren Füßen ausgleichen",
          "Vor direkter Sonneneinstrahlung schützen",
        ],
      },
      { type: "subheading", text: "Betrieb" },
      {
        type: "list",
        items: [
          "Vor jeder Nutzung Funktionsprüfung durchführen",
          "Bei Defekten sofort außer Betrieb nehmen",
          "Keine eigenständigen Veränderungen vornehmen",
        ],
      },
      { type: "subheading", text: "Transport" },
      {
        type: "list",
        items: [
          "Gerät niemals schieben",
          "Immer mit mindestens 2 Personen anheben",
          "Unterlage zum Schutz des Bodens verwenden",
        ],
      },
    ],
  },
  {
    id: "technische-daten",
    number: "3",
    title: "Technische Spezifikationen",
    icon: "📊",
    blocks: [
      {
        type: "table",
        rows: [
          { label: "Artikel", value: "Box Maschine EU" },
          { label: "Artikelnummer", value: "2025101" },
          { label: "Gewicht", value: "ca. 127–146 kg" },
          { label: "Maße", value: "ca. 112 x 76 x 210 cm" },
          { label: "Stromverbrauch", value: "ca. 40–60 Watt" },
        ],
      },
    ],
  },
  {
    id: "wartung-pflege",
    number: "4",
    title: "Wartung & Pflege",
    icon: "🔧",
    blocks: [
      { type: "subheading", text: "Alle 2 Wochen (empfohlen)" },
      {
        type: "list",
        items: [
          "Luftdruck prüfen: 1,5 – 2,0 Bar",
          "Ball darf sich nicht drehen",
          "Armprotektoren kontrollieren",
          "Kabel & Verbindungen prüfen",
          "Standfestigkeit kontrollieren",
        ],
      },
      { type: "subheading", text: "Monatlich" },
      {
        type: "list",
        items: ["Schrauben und Muttern prüfen", "Mechanik schmieren", "Münzprüfer reinigen"],
      },
      { type: "subheading", text: "Alle 2 Monate / nach 1000 Schlägen" },
      {
        type: "list",
        items: ["Abstand der Mechanik prüfen", "Stoßfänger kontrollieren"],
      },
    ],
  },
  {
    id: "wartung-mechanik",
    number: "5",
    title: "Wartung der Mechanik",
    icon: "⚙️",
    blocks: [
      {
        type: "list",
        items: [
          "Bewegliche Teile regelmäßig mit WD-40 oder Schmierfett behandeln",
          "Federmechanismus prüfen",
          "Geschwindigkeit des Balls kontrollieren",
        ],
      },
    ],
  },
  {
    id: "schlagball-tausch",
    number: "6",
    title: "Austausch des Schlagballs",
    icon: "🥊",
    blocks: [
      {
        type: "list",
        ordered: true,
        items: [
          "Seil lösen",
          "Ball öffnen",
          "Innenblase entnehmen",
          "Neue Blase einsetzen",
          "Ventil korrekt positionieren",
          "Ball aufblasen (max. 2 Bar)",
        ],
      },
    ],
  },
  {
    id: "fehlerbehebung",
    number: "7",
    title: "Fehlerbehebung",
    icon: "🛠️",
    blocks: [
      {
        type: "callout",
        variant: "warning",
        lines: ["Reparaturen nur durch Fachpersonal!"],
      },
      { type: "subheading", text: "Gerät startet nicht" },
      {
        type: "list",
        items: ["Sicherungen prüfen (5A)", "Stromverbindung prüfen", "Hauptplatine prüfen"],
      },
      { type: "subheading", text: "Münzprüfer funktioniert nicht" },
      {
        type: "list",
        items: ["Auf Verstopfung prüfen", "Reinigen", "Kabel prüfen (+ / GND / Pulse)"],
      },
      { type: "subheading", text: "Scheinleser funktioniert nicht" },
      { type: "list", items: ["Reinigen", "Kabel prüfen"] },
      { type: "subheading", text: "Buttons funktionieren nicht" },
      { type: "list", items: ["Kabelverbindung prüfen", "Schalter prüfen"] },
    ],
  },
  {
    id: "montage",
    number: "8",
    title: "Montage & Inbetriebnahme",
    icon: "🔌",
    blocks: [
      {
        type: "list",
        items: [
          "Gerät wird betriebsbereit geliefert",
          "Stromkabel anschließen",
          "Gerät einschalten",
        ],
      },
      {
        type: "paragraph",
        text: "👉 Schrauben & Kabel befinden sich im Inneren der Maschine.",
      },
    ],
  },
  {
    id: "menuefuehrung",
    number: "9",
    title: "Menüführung",
    icon: "📋",
    blocks: [
      {
        type: "paragraph",
        text:
          "Das Menü dient zur Konfiguration aller Spiel-, Anzeige- und Hardware-Parameter des Boxautomaten. Im Folgenden findest du klare Schrittfolgen, wie du in jeden Bereich gelangst und welche Unterpunkte verfügbar sind.",
      },

      { type: "subheading", text: "9.1 Hauptmenü öffnen" },
      {
        type: "list",
        ordered: true,
        items: [
          "Gerät einschalten und warten, bis der Demo-Bildschirm erscheint.",
          "Die OK-Taste am Bedienfeld drücken, um das Hauptmenü zu öffnen.",
          "Mit den Pfeiltasten ▲ / ▼ durch die Einträge navigieren.",
          "Mit OK einen Eintrag bestätigen, mit ESC / ZURÜCK eine Ebene zurück.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Tasten-Übersicht",
        lines: [
          "OK = Auswahl bestätigen / Untermenü öffnen",
          "▲ / ▼ = Eintrag wählen bzw. Wert erhöhen / verringern",
          "ESC / ZURÜCK = Eine Ebene zurück / Menü verlassen",
        ],
      },

      { type: "subheading", text: "9.2 Einstellungen (Standardmenü)" },
      {
        type: "paragraph",
        text:
          "Schrittfolge: Hauptmenü → „Einstellungen“ → mit ▲/▼ Eintrag wählen → OK zum Bearbeiten → Wert mit ▲/▼ ändern → OK speichern.",
      },
      {
        type: "table",
        rows: [
          { label: "Sprache", value: "Menüsprache wählen (DE / EN / weitere)" },
          { label: "Kredit 1", value: "Anzahl Credits pro Münzkanal 1" },
          { label: "Kredit 2", value: "Anzahl Credits pro Münzkanal 2" },
          { label: "Lautstärke", value: "Lautstärke der Sound-Effekte und Musik (0–100)" },
          { label: "Schwierigkeitsgrad", value: "Empfindlichkeit / Punkteskalierung anpassen" },
          { label: "Demo-Musik AN/AUS", value: "Hintergrundmusik im Demo-Modus aktivieren" },
          { label: "Freispiele", value: "Freispiel-Schwelle ab einer bestimmten Punktzahl" },
          { label: "Schnellstart", value: "Spiel ohne Countdown direkt starten" },
          { label: "Anzeige (999 / 3000)", value: "Maximalwert der Punkteanzeige umschalten" },
          { label: "Ballauswurf (Manuell / Auto)", value: "Schlagball nach Spielende automatisch ausgeben" },
          { label: "Testmenü", value: "Zugang zum Hardware-Testmenü (siehe 9.3)" },
        ],
      },

      { type: "subheading", text: "9.3 Testmenü öffnen" },
      {
        type: "paragraph",
        text:
          "Das Testmenü dient zur Prüfung aller Hardware-Komponenten – nutze es nach jeder Wartung oder bei Fehlerverdacht.",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Im Demo-Bildschirm OK drücken → Hauptmenü öffnet sich.",
          "Mit ▲/▼ den Eintrag „Einstellungen“ wählen und mit OK bestätigen.",
          "In der Liste nach unten scrollen bis zum Eintrag „Testmenü“.",
          "OK drücken – das Testmenü öffnet sich.",
          "Komponente mit ▲/▼ wählen und mit OK starten (z. B. Sensor, LED, Münzprüfer).",
          "Mit ESC die Komponente verlassen, erneut ESC führt zurück ins Hauptmenü.",
        ],
      },
      {
        type: "list",
        items: [
          "Sensor-Test: Schlagsensor auslösen → angezeigter Wert muss reagieren.",
          "Münzprüfer-Test: Münze einwerfen → Kanal & Wert müssen erkannt werden.",
          "LED-Test: Alle LED-Segmente und Beleuchtungsringe werden durchgeschaltet.",
          "Sound-Test: Effekte und Musik werden nacheinander abgespielt.",
          "Display-Test: Punkteanzeige zeigt Testmuster (alle Segmente).",
          "Ballauswurf-Test: Mechanik gibt den Ball manuell aus.",
        ],
      },

      { type: "subheading", text: "9.4 Erweiterte Einstellungen (Passwort: 1111)" },
      {
        type: "paragraph",
        text:
          "Schrittfolge: Hauptmenü → „Erweiterte Einstellungen“ → Passwort 1111 mit ▲/▼ und OK eingeben → gewünschten Unterpunkt wählen.",
      },
      {
        type: "list",
        items: [
          "Werkseinstellungen: Setzt alle Parameter auf Auslieferungszustand zurück. Achtung: Eigene Einstellungen gehen verloren.",
          "LED Einstellungen: Helligkeit, Farbprofile und Animationen der Beleuchtung anpassen.",
          "Maschinentyp (BOX / COMBO): Konfiguration auf reine Box-Maschine oder Box & Kick Combo umstellen.",
        ],
      },
      {
        type: "callout",
        variant: "warning",
        title: "Hinweis zum Passwort",
        lines: [
          "Das Standard-Passwort lautet 1111.",
          "Änderungen in den erweiterten Einstellungen sollten nur durch geschultes Personal erfolgen.",
        ],
      },

      { type: "subheading", text: "9.5 Menü verlassen & Speichern" },
      {
        type: "list",
        ordered: true,
        items: [
          "Geänderten Wert mit OK bestätigen – die Einstellung wird sofort gespeichert.",
          "Mit ESC schrittweise bis zum Demo-Bildschirm zurückgehen.",
          "Bei kritischen Änderungen (z. B. Maschinentyp) das Gerät kurz aus- und wieder einschalten.",
        ],
      },
    ],
  },
  {
    id: "wichtige-hinweise",
    number: "10",
    title: "Wichtige Hinweise",
    icon: "💡",
    blocks: [
      {
        type: "callout",
        variant: "info",
        lines: [
          "Gerät nur bestimmungsgemäß verwenden",
          "Wartung regelmäßig durchführen",
          "Bei Problemen sofort abschalten",
        ],
      },
    ],
  },
];

export const HANDBUCH_BOXAUTOMAT_FAQ: HandbuchFaqItem[] = [
  {
    question: "Wofür wird der Boxautomat verwendet?",
    answer:
      "Der Boxautomat ist ein Unterhaltungsgerät zur Messung der Schlag- und Trittkraft. Er wird in Nachtclubs, Bars, Fitnessstudios und Freizeitbereichen eingesetzt und bietet einen Boxmodus (Schlagkraft) sowie einen Kickmodus (Trittkraft). Es handelt sich nicht um ein medizinisches Messgerät.",
  },
  {
    question: "Welcher Luftdruck ist für den Schlagball des Boxautomaten optimal?",
    answer:
      "Der empfohlene Luftdruck für den Schlagball liegt zwischen 1,5 und 2,0 Bar. Beim Aufpumpen darf ein maximaler Druck von 2 Bar nicht überschritten werden. Eine Kontrolle des Luftdrucks sollte alle zwei Wochen erfolgen.",
  },
  {
    question: "Was tun, wenn der Boxautomat nicht startet?",
    answer:
      "Wenn der Boxautomat nicht startet, sollten zuerst die 5A-Sicherungen sowie die Stromverbindung geprüft werden. Funktioniert das Gerät weiterhin nicht, ist die Hauptplatine zu kontrollieren. Reparaturen dürfen ausschließlich durch qualifiziertes Fachpersonal durchgeführt werden.",
  },
  {
    question: "Wie wird der Schlagball der Box & Kick Maschine ausgetauscht?",
    answer:
      "Zum Wechseln des Schlagballs wird zunächst das Seil gelöst und der Ball geöffnet. Anschließend wird die alte Innenblase entnommen, eine neue Blase eingesetzt und das Ventil korrekt positioniert. Zum Schluss wird der Ball auf maximal 2 Bar aufgepumpt.",
  },
  {
    question: "Wie öffne ich das erweiterte Menü des Boxautomaten?",
    answer:
      "Das Hauptmenü wird mit der OK-Taste aufgerufen. Die erweiterten Einstellungen (Werkseinstellungen, LED-Konfiguration, Maschinentyp BOX/COMBO) sind durch das Passwort 1111 geschützt.",
  },
  {
    question: "Welche technischen Daten hat der Boxautomat?",
    answer:
      "Der Boxautomat (Artikelnummer 2025101) wiegt ca. 127–146 kg, hat die Maße ca. 112 × 76 × 210 cm und einen Stromverbrauch von ca. 40–60 Watt bei Anschluss an das normale 220V-Stromnetz.",
  },
];
