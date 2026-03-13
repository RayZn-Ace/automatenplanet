export interface ProductSeoContent {
  features: { de: string; en: string }[];
  useCases: { de: string; en: string }[];
  benefits: { de: string; en: string }[];
  faq: { question: { de: string; en: string }; answer: { de: string; en: string } }[];
  included: { de: string; en: string }[];
  roiMonths?: number;
  lifestyleImage?: string;
  longDescription: { de: string; en: string };
}

type SeoContentMap = Record<string, ProductSeoContent>;

export const productSeoContent: SeoContentMap = {
  "greifautomat": {
    longDescription: {
      de: "Der Greifautomat ist der absolute Klassiker unter den Unterhaltungsautomaten. Mit seiner einstellbaren Greifkraft, professioneller LED-Beleuchtung und robuster Bauweise ist er die ideale Wahl für jeden Standort mit Laufkundschaft. Ob Kiosk, Späti, Shoppingcenter oder Gastronomie – der Greifautomat zieht Kunden magisch an und generiert zuverlässig passives Einkommen. Die hochwertige Verarbeitung garantiert einen störungsfreien Dauerbetrieb.",
      en: "The claw machine is the ultimate classic among entertainment machines. With its adjustable grip strength, professional LED lighting, and robust construction, it's the ideal choice for any location with foot traffic. Whether kiosk, convenience store, shopping center, or restaurant – the claw machine attracts customers like a magnet and reliably generates passive income."
    },
    features: [
      { de: "Einstellbare Greifkraft für optimale Gewinnquote", en: "Adjustable grip strength for optimal win rate" },
      { de: "Brillante LED-Beleuchtung für maximale Aufmerksamkeit", en: "Brilliant LED lighting for maximum attention" },
      { de: "Münzprüfer und optionaler Geldscheinakzeptor", en: "Coin validator and optional banknote acceptor" },
      { de: "Robustes Gehäuse aus Stahlkonstruktion", en: "Robust steel frame housing" },
      { de: "Einfache Befüllung durch große Servicetür", en: "Easy refilling through large service door" },
      { de: "Elektronische Steuerung mit Fehlerdiagnose", en: "Electronic control with error diagnostics" },
    ],
    useCases: [
      { de: "Kioske & Spätis", en: "Kiosks & Convenience Stores" },
      { de: "Shoppingcenter & Einkaufszentren", en: "Shopping Centers & Malls" },
      { de: "Restaurants & Gastronomie", en: "Restaurants & Gastronomy" },
      { de: "Arcades & Spielhallen", en: "Arcades & Game Centers" },
      { de: "Hotels & Freizeitparks", en: "Hotels & Amusement Parks" },
      { de: "Tankstellen & Raststätten", en: "Gas Stations & Rest Areas" },
    ],
    benefits: [
      { de: "Passives Einkommen ohne Personalaufwand", en: "Passive income without staffing costs" },
      { de: "Schnelle Amortisation in 3-6 Monaten", en: "Quick ROI within 3-6 months" },
      { de: "Geringer Wartungsaufwand", en: "Low maintenance requirements" },
      { de: "Kundenbindung durch Spielspaß", en: "Customer retention through entertainment" },
      { de: "24/7 Betrieb möglich", en: "24/7 operation possible" },
    ],
    faq: [
      {
        question: { de: "Wie hoch ist die Gewinnquote einstellbar?", en: "How adjustable is the win rate?" },
        answer: { de: "Die Greifkraft lässt sich stufenlos einstellen, sodass Sie die Gewinnquote optimal an Ihren Standort anpassen können. Empfohlen wird eine Quote von 1:10 bis 1:15.", en: "The grip strength is infinitely adjustable, so you can optimize the win rate for your location. A ratio of 1:10 to 1:15 is recommended." }
      },
      {
        question: { de: "Welche Stromversorgung wird benötigt?", en: "What power supply is required?" },
        answer: { de: "Der Automat benötigt eine Standard-Steckdose (220V). Der Stromverbrauch liegt bei ca. 200W, was monatlichen Stromkosten von unter 15€ entspricht.", en: "The machine requires a standard outlet (220V). Power consumption is about 200W, equaling monthly electricity costs under €15." }
      },
      {
        question: { de: "Wie oft muss der Automat befüllt werden?", en: "How often does the machine need refilling?" },
        answer: { de: "Je nach Standort und Besucherfrequenz alle 1-4 Wochen. Die große Servicetür ermöglicht schnelles Befüllen in unter 10 Minuten.", en: "Depending on location and traffic, every 1-4 weeks. The large service door allows quick refilling in under 10 minutes." }
      },
      {
        question: { de: "Gibt es eine Garantie?", en: "Is there a warranty?" },
        answer: { de: "Ja, alle unsere Automaten haben 12 Monate Garantie. Ersatzteile sind jederzeit verfügbar und werden innerhalb von 24h verschickt.", en: "Yes, all our machines come with a 12-month warranty. Spare parts are always available and shipped within 24h." }
      },
    ],
    included: [
      { de: "1x Greifautomat komplett montiert", en: "1x Claw machine fully assembled" },
      { de: "2x Schlüssel", en: "2x Keys" },
      { de: "1x Münzprüfer (vorkonfiguriert)", en: "1x Coin validator (pre-configured)" },
      { de: "1x Bedienungsanleitung", en: "1x User manual" },
      { de: "Starterset mit Plüschtieren", en: "Starter set with plush toys" },
    ],
    roiMonths: 4,
    lifestyleImage: "/images/products/lifestyle/claw-machine-supermarket.jpg",
  },

  "boxautomat-mit-geldscheinakzeptor": {
    longDescription: {
      de: "Der Boxautomat mit Geldscheinakzeptor ist der ultimative Umsatzbringer für Bars, Clubs und Fitnessstudios. Mit integriertem Geldscheinakzeptor akzeptiert er sowohl Münzen als auch Scheine, was die Umsätze deutlich steigert. Das digitale LED-Display und das Highscore-System motivieren Spieler zu wiederholten Versuchen.",
      en: "The boxing machine with banknote acceptor is the ultimate revenue generator for bars, clubs, and fitness studios. With its integrated banknote acceptor, it accepts both coins and bills, significantly increasing revenue. The digital LED display and highscore system motivate players to try again."
    },
    features: [
      { de: "Integrierter Geldscheinakzeptor für höhere Umsätze", en: "Integrated banknote acceptor for higher revenue" },
      { de: "Digitales LED-Display mit Kraftanzeige", en: "Digital LED display with force readout" },
      { de: "Highscore-System mit Speicher", en: "Highscore system with memory" },
      { de: "Robustes Boxpolster für Dauerbetrieb", en: "Robust boxing pad for continuous operation" },
      { de: "Einstellbare Schwierigkeitsgrade", en: "Adjustable difficulty levels" },
      { de: "Attraktive LED-Beleuchtung", en: "Attractive LED lighting" },
    ],
    useCases: [
      { de: "Bars & Kneipen", en: "Bars & Pubs" },
      { de: "Clubs & Diskotheken", en: "Clubs & Nightclubs" },
      { de: "Fitnessstudios", en: "Fitness Studios" },
      { de: "Einkaufszentren", en: "Shopping Centers" },
      { de: "Messen & Events", en: "Trade Fairs & Events" },
    ],
    benefits: [
      { de: "Höchste Umsätze durch Geldscheinakzeptor", en: "Highest revenue through banknote acceptor" },
      { de: "Extrem robuste Bauweise", en: "Extremely robust construction" },
      { de: "Wettbewerbs-Charakter zieht Gruppen an", en: "Competitive character attracts groups" },
      { de: "Minimaler Wartungsaufwand", en: "Minimal maintenance" },
    ],
    faq: [
      {
        question: { de: "Welche Scheine akzeptiert der Geldscheinakzeptor?", en: "Which bills does the acceptor take?" },
        answer: { de: "Der Geldscheinakzeptor akzeptiert 5€, 10€ und 20€ Scheine. Die Akzeptanz kann individuell konfiguriert werden.", en: "The banknote acceptor takes €5, €10, and €20 bills. Acceptance can be individually configured." }
      },
      {
        question: { de: "Wie laut ist der Boxautomat?", en: "How loud is the boxing machine?" },
        answer: { de: "Der Automat hat einen angemessenen Geräuschpegel, der für Bar- und Club-Umgebungen ideal ist. In ruhigeren Umgebungen kann die Lautstärke reduziert werden.", en: "The machine has an appropriate noise level ideal for bar and club environments. In quieter settings, the volume can be reduced." }
      },
    ],
    included: [
      { de: "1x Boxautomat komplett montiert", en: "1x Boxing machine fully assembled" },
      { de: "1x Geldscheinakzeptor (installiert)", en: "1x Banknote acceptor (installed)" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
      { de: "2x Schlüssel", en: "2x Keys" },
      { de: "1x Bedienungsanleitung", en: "1x User manual" },
    ],
    roiMonths: 3,
    lifestyleImage: "/images/products/lifestyle/boxing-machine-bar.jpg",
  },

  "combo-boxautomat": {
    longDescription: {
      de: "Der Combo Boxautomat vereint Schlagkraftmessung mit interaktiven Spielmodi und bietet damit maximale Unterhaltung. Durch die Kombination verschiedener Spielvarianten bleibt der Automat auch für Stammkunden immer interessant und generiert überdurchschnittliche Umsätze.",
      en: "The Combo Boxing Machine combines force measurement with interactive game modes, offering maximum entertainment. The combination of different game variants keeps the machine interesting even for regular customers, generating above-average revenue."
    },
    features: [
      { de: "Mehrere interaktive Spielmodi", en: "Multiple interactive game modes" },
      { de: "Präzise digitale Schlagkraftmessung", en: "Precise digital force measurement" },
      { de: "Highscore-System mit Speicher", en: "Highscore system with memory" },
      { de: "Premium LED-Beleuchtung", en: "Premium LED lighting" },
      { de: "Verstärktes Boxpolster", en: "Reinforced boxing pad" },
      { de: "Münz- und Scheinakzeptor", en: "Coin and banknote acceptor" },
    ],
    useCases: [
      { de: "Premium Arcades", en: "Premium Arcades" },
      { de: "Events & Firmenfeiern", en: "Events & Corporate Parties" },
      { de: "Gastronomie & Nachtleben", en: "Gastronomy & Nightlife" },
      { de: "Einkaufszentren", en: "Shopping Centers" },
    ],
    benefits: [
      { de: "Mehrere Spielmodi = mehr Wiederholungen", en: "Multiple game modes = more replays" },
      { de: "Premium-Bauweise für höchste Beanspruchung", en: "Premium build for highest demands" },
      { de: "Überdurchschnittliche Umsätze", en: "Above-average revenue" },
    ],
    faq: [
      {
        question: { de: "Was unterscheidet den Combo vom Standard-Boxautomat?", en: "What differentiates the Combo from the standard boxing machine?" },
        answer: { de: "Der Combo bietet mehrere Spielmodi statt nur reiner Kraftmessung. Dadurch ist er für ein breiteres Publikum interessant und generiert mehr Umsatz.", en: "The Combo offers multiple game modes instead of just force measurement. This makes it appealing to a broader audience and generates more revenue." }
      },
    ],
    included: [
      { de: "1x Combo Boxautomat komplett montiert", en: "1x Combo boxing machine fully assembled" },
      { de: "1x Münz- und Geldscheinakzeptor", en: "1x Coin and banknote acceptor" },
      { de: "2x Schlüssel", en: "2x Keys" },
      { de: "1x Bedienungsanleitung", en: "1x User manual" },
    ],
    roiMonths: 3,
    lifestyleImage: "/images/products/lifestyle/boxing-machine-bar.jpg",
  },

  "boxautomat-ohne-geldscheinakzeptor": {
    longDescription: {
      de: "Der münzbetriebene Boxautomat ist die günstige Einstiegsoption für jeden Standort. Er bietet dieselbe robuste Qualität und das beliebte Highscore-System, verzichtet aber auf den Geldscheinakzeptor – ideal wenn Münzbetrieb ausreicht.",
      en: "The coin-operated boxing machine is the affordable entry option for any location. It offers the same robust quality and popular highscore system but without the banknote acceptor – ideal when coin operation is sufficient."
    },
    features: [
      { de: "Digitales LED-Display mit Kraftanzeige", en: "Digital LED display with force readout" },
      { de: "Highscore-System mit Speicher", en: "Highscore system with memory" },
      { de: "Robustes Boxpolster", en: "Robust boxing pad" },
      { de: "Münzprüfer für gängige Münzen", en: "Coin validator for common coins" },
      { de: "Einstellbare Schwierigkeitsgrade", en: "Adjustable difficulty levels" },
    ],
    useCases: [
      { de: "Bars & Kneipen", en: "Bars & Pubs" },
      { de: "Imbisse & Restaurants", en: "Snack Bars & Restaurants" },
      { de: "Jugendclubs", en: "Youth Clubs" },
      { de: "Freizeiteinrichtungen", en: "Leisure Facilities" },
    ],
    benefits: [
      { de: "Günstigster Einstiegspreis", en: "Lowest entry price" },
      { de: "Bewährte Technik", en: "Proven technology" },
      { de: "Schnelle Amortisation", en: "Quick ROI" },
    ],
    faq: [
      {
        question: { de: "Kann ich später einen Geldscheinakzeptor nachrüsten?", en: "Can I add a banknote acceptor later?" },
        answer: { de: "Ja, ein Geldscheinakzeptor kann jederzeit nachgerüstet werden. Kontaktieren Sie uns für die Nachrüstoption.", en: "Yes, a banknote acceptor can be retrofitted at any time. Contact us for the retrofit option." }
      },
    ],
    included: [
      { de: "1x Boxautomat komplett montiert", en: "1x Boxing machine fully assembled" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
      { de: "2x Schlüssel", en: "2x Keys" },
      { de: "1x Bedienungsanleitung", en: "1x User manual" },
    ],
    roiMonths: 4,
    lifestyleImage: "/images/products/lifestyle/boxing-machine-bar.jpg",
  },

  "basketball-machine": {
    longDescription: {
      de: "Die Basketball Arcade Machine bringt den Nervenkitzel des Basketballs in Ihren Standort. Mit Timer, elektronischem Punktezähler und Multiplayer-Modus ist sie ein garantierter Publikumsmagnet. Die auffällige Neon-LED-Beleuchtung sorgt dafür, dass der Automat schon von Weitem alle Blicke auf sich zieht.",
      en: "The Basketball Arcade Machine brings the thrill of basketball to your location. With timer, electronic score counter, and multiplayer mode, it's a guaranteed crowd magnet. The eye-catching neon LED lighting ensures the machine draws attention from afar."
    },
    features: [
      { de: "Elektronischer Punktezähler mit Timer", en: "Electronic score counter with timer" },
      { de: "Multiplayer-Modus für 2 Spieler", en: "Multiplayer mode for 2 players" },
      { de: "Neon-LED-Beleuchtung", en: "Neon LED lighting" },
      { de: "Robuster Stahlrahmen", en: "Robust steel frame" },
      { de: "Automatischer Ballrücklauf", en: "Automatic ball return" },
    ],
    useCases: [
      { de: "Arcades & Spielhallen", en: "Arcades & Game Centers" },
      { de: "Shoppingcenter", en: "Shopping Centers" },
      { de: "Events & Messen", en: "Events & Trade Fairs" },
      { de: "Freizeitparks", en: "Amusement Parks" },
    ],
    benefits: [
      { de: "Multiplayer = doppelte Einnahmen", en: "Multiplayer = double revenue" },
      { de: "Universell beliebt bei allen Altersgruppen", en: "Universally popular with all age groups" },
      { de: "Hohe Wiederholungsrate", en: "High replay rate" },
    ],
    faq: [
      {
        question: { de: "Wie viele Bälle sind enthalten?", en: "How many balls are included?" },
        answer: { de: "Im Lieferumfang sind 4 professionelle Arcade-Basketbälle enthalten.", en: "4 professional arcade basketballs are included." }
      },
    ],
    included: [
      { de: "1x Basketball Machine komplett montiert", en: "1x Basketball machine fully assembled" },
      { de: "4x Arcade-Basketbälle", en: "4x Arcade basketballs" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
      { de: "2x Schlüssel", en: "2x Keys" },
    ],
    roiMonths: 4,
    lifestyleImage: "/images/products/lifestyle/basketball-arcade.jpg",
  },

  "air-hockey-table": {
    longDescription: {
      de: "Der Air Hockey Tisch ist ein zeitloser Klassiker, der in keiner Arcade fehlen darf. Mit LED-Beleuchtung und elektronischem Punktezähler bietet er spannendes Spielerlebnis für zwei Spieler. Die robuste Bauweise garantiert jahrelangen störungsfreien Betrieb.",
      en: "The Air Hockey Table is a timeless classic that belongs in every arcade. With LED lighting and electronic score counter, it offers exciting gameplay for two players. The robust construction guarantees years of trouble-free operation."
    },
    features: [
      { de: "Glatte Hochleistungs-Spielfläche", en: "Smooth high-performance playing surface" },
      { de: "Elektronischer Punktezähler", en: "Electronic score counter" },
      { de: "LED-Beleuchtung an allen Seiten", en: "LED lighting on all sides" },
      { de: "Münzbetrieben", en: "Coin-operated" },
      { de: "Inklusive Pucks und Schläger", en: "Including pucks and strikers" },
    ],
    useCases: [
      { de: "Arcades & Spielhallen", en: "Arcades & Game Centers" },
      { de: "Bars & Restaurants", en: "Bars & Restaurants" },
      { de: "Jugendeinrichtungen", en: "Youth Facilities" },
      { de: "Büros & Break Rooms", en: "Offices & Break Rooms" },
    ],
    benefits: [
      { de: "Zwei-Spieler-Spiel = soziales Erlebnis", en: "Two-player game = social experience" },
      { de: "Geringer Platzbedarf", en: "Low space requirements" },
      { de: "Minimaler Wartungsaufwand", en: "Minimal maintenance" },
    ],
    faq: [
      {
        question: { de: "Wie laut ist der Luftstrom?", en: "How loud is the airflow?" },
        answer: { de: "Der Luftstrom ist moderat und in normalen Umgebungen kaum wahrnehmbar.", en: "The airflow is moderate and barely noticeable in normal environments." }
      },
    ],
    included: [
      { de: "1x Air Hockey Tisch", en: "1x Air Hockey Table" },
      { de: "4x Pucks", en: "4x Pucks" },
      { de: "2x Schläger", en: "2x Strikers" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
    ],
    roiMonths: 5,
    lifestyleImage: "/images/products/lifestyle/air-hockey-arcade.jpg",
  },

  "arcade-machine": {
    longDescription: {
      de: "Die Arcade Machine vereint hunderte klassische Spieleklassiker in einem einzigen Gerät. Mit modernem HD-Display und authentischem Retro-Design ist sie der perfekte Automat für jeden Standort. Von Pac-Man bis Street Fighter – hier wird jeder fündig.",
      en: "The Arcade Machine combines hundreds of classic game titles in a single device. With a modern HD display and authentic retro design, it's the perfect machine for any location. From Pac-Man to Street Fighter – there's something for everyone."
    },
    features: [
      { de: "Hunderte klassische Spiele vorinstalliert", en: "Hundreds of classic games pre-installed" },
      { de: "HD-Display für gestochen scharfe Grafik", en: "HD display for crisp graphics" },
      { de: "Authentische Retro-Joysticks und Buttons", en: "Authentic retro joysticks and buttons" },
      { de: "2-Spieler-Modus", en: "2-player mode" },
      { de: "Lautstärkeregelung", en: "Volume control" },
    ],
    useCases: [
      { de: "Arcades & Spielhallen", en: "Arcades & Game Centers" },
      { de: "Bars & Restaurants", en: "Bars & Restaurants" },
      { de: "Wartebereiche", en: "Waiting Areas" },
      { de: "Hotels & Hostels", en: "Hotels & Hostels" },
    ],
    benefits: [
      { de: "Hunderte Spiele = nie langweilig", en: "Hundreds of games = never boring" },
      { de: "Nostalgie-Faktor zieht alle Altersgruppen an", en: "Nostalgia factor attracts all ages" },
      { de: "Kompakte Bauweise", en: "Compact design" },
    ],
    faq: [
      {
        question: { de: "Kann ich weitere Spiele hinzufügen?", en: "Can I add more games?" },
        answer: { de: "Die Arcade Machine kommt mit einer umfangreichen Spielesammlung. Weitere Spiele können auf Anfrage hinzugefügt werden.", en: "The arcade machine comes with an extensive game collection. Additional games can be added on request." }
      },
    ],
    included: [
      { de: "1x Arcade Machine komplett montiert", en: "1x Arcade machine fully assembled" },
      { de: "Alle Spiele vorinstalliert", en: "All games pre-installed" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
      { de: "2x Schlüssel", en: "2x Keys" },
    ],
    roiMonths: 5,
    lifestyleImage: "/images/products/lifestyle/arcade-machine-bar.jpg",
  },

  "pink-date-machine": {
    longDescription: {
      de: "Die Pink Date Machine ist der absolute Blickfang unter den Greifautomaten. Das auffällige pinke Design mit Premium-LED-Beleuchtung zieht garantiert alle Blicke auf sich. Besonders beliebt bei jüngeren Zielgruppen und in Shoppingcentern.",
      en: "The Pink Date Machine is the ultimate eye-catcher among claw machines. The striking pink design with premium LED lighting is guaranteed to attract attention. Especially popular with younger demographics and in shopping centers."
    },
    features: [
      { de: "Einzigartiges Pink-Design", en: "Unique pink design" },
      { de: "Premium LED-Beleuchtung", en: "Premium LED lighting" },
      { de: "Einstellbare Greifkraft", en: "Adjustable grip strength" },
      { de: "Große Spielfläche", en: "Large play area" },
      { de: "Münzprüfer inklusive", en: "Coin validator included" },
    ],
    useCases: [
      { de: "Shoppingcenter & Malls", en: "Shopping Centers & Malls" },
      { de: "Arcades", en: "Arcades" },
      { de: "Events & Partys", en: "Events & Parties" },
      { de: "Kinos", en: "Cinemas" },
    ],
    benefits: [
      { de: "Maximale Aufmerksamkeit durch Design", en: "Maximum attention through design" },
      { de: "Besonders beliebt bei jüngerer Zielgruppe", en: "Especially popular with younger demographics" },
      { de: "Instagram-tauglich = kostenlose Werbung", en: "Instagram-worthy = free advertising" },
    ],
    faq: [
      {
        question: { de: "Ist die Farbe anpassbar?", en: "Is the color customizable?" },
        answer: { de: "Die Pink Date Machine ist in ihrem ikonischen Pink erhältlich. Für individuelle Farbwünsche kontaktieren Sie uns.", en: "The Pink Date Machine is available in its iconic pink. For custom color requests, contact us." }
      },
    ],
    included: [
      { de: "1x Pink Date Machine komplett montiert", en: "1x Pink Date Machine fully assembled" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
      { de: "2x Schlüssel", en: "2x Keys" },
      { de: "Starterset mit Plüschtieren", en: "Starter set with plush toys" },
    ],
    roiMonths: 4,
    lifestyleImage: "/images/products/lifestyle/pink-date-machine-mall.jpg",
  },

  "lucky-7-machine": {
    longDescription: {
      de: "Die Lucky 7 Machine ist ein Premium-Greifautomat mit digitalem Punktesystem. Besonders an Standorten mit hoher Besucherfrequenz erzielt sie überdurchschnittliche Umsätze. Das attraktive Design und die ausgefeilte LED-Beleuchtung machen sie zum Star jeder Location.",
      en: "The Lucky 7 Machine is a premium claw machine with a digital scoring system. It achieves above-average revenue especially at high-traffic locations. The attractive design and sophisticated LED lighting make it the star of any location."
    },
    features: [
      { de: "Digitales Punktesystem", en: "Digital scoring system" },
      { de: "Auffällige LED-Beleuchtung", en: "Eye-catching LED lighting" },
      { de: "Robuste Premium-Bauweise", en: "Robust premium construction" },
      { de: "Einstellbare Greifkraft", en: "Adjustable grip strength" },
      { de: "Großes Fassungsvermögen", en: "Large capacity" },
    ],
    useCases: [
      { de: "Hochfrequenz-Standorte", en: "High-traffic locations" },
      { de: "Shoppingcenter", en: "Shopping Centers" },
      { de: "Freizeitparks", en: "Amusement Parks" },
      { de: "Flughäfen & Bahnhöfe", en: "Airports & Train Stations" },
    ],
    benefits: [
      { de: "Überdurchschnittliche Umsätze", en: "Above-average revenue" },
      { de: "Premium-Look für gehobene Standorte", en: "Premium look for upscale locations" },
      { de: "Digitales Punktesystem für mehr Engagement", en: "Digital scoring system for more engagement" },
    ],
    faq: [
      {
        question: { de: "Was ist das Besondere am Punktesystem?", en: "What's special about the scoring system?" },
        answer: { de: "Das digitale Punktesystem sammelt Punkte über mehrere Spiele. Kunden spielen häufiger, um Punkte zu sammeln.", en: "The digital scoring system accumulates points across multiple games. Customers play more often to collect points." }
      },
    ],
    included: [
      { de: "1x Lucky 7 Machine komplett montiert", en: "1x Lucky 7 Machine fully assembled" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
      { de: "2x Schlüssel", en: "2x Keys" },
      { de: "Starterset mit Plüschtieren", en: "Starter set with plush toys" },
    ],
    roiMonths: 3,
    lifestyleImage: "/images/products/lifestyle/claw-machine-supermarket.jpg",
  },

  "elektronischer-hau-den-lukas": {
    longDescription: {
      de: "Der elektronische Hau den Lukas bringt den Volksfest-Klassiker in die moderne Zeit. Statt Hammer und Glocke gibt es digitale Kraftmessung, LED-Anzeige und ein spannendes Highscore-System. Perfekt für Events, Messen und überall dort, wo Kraft und Spaß aufeinandertreffen.",
      en: "The electronic High Striker brings the fairground classic into the modern era. Instead of hammer and bell, there's digital force measurement, LED display, and an exciting highscore system. Perfect for events, fairs, and anywhere strength meets fun."
    },
    features: [
      { de: "Digitale Kraftmessung", en: "Digital force measurement" },
      { de: "LED-Anzeige mit Animation", en: "LED display with animation" },
      { de: "Highscore-System", en: "Highscore system" },
      { de: "Robuste Konstruktion", en: "Robust construction" },
      { de: "Verschiedene Schwierigkeitsstufen", en: "Various difficulty levels" },
    ],
    useCases: [
      { de: "Events & Firmenfeiern", en: "Events & Corporate Parties" },
      { de: "Messen & Ausstellungen", en: "Trade Fairs & Exhibitions" },
      { de: "Bars & Clubs", en: "Bars & Clubs" },
      { de: "Arcades", en: "Arcades" },
    ],
    benefits: [
      { de: "Bekanntes Spielprinzip", en: "Well-known game concept" },
      { de: "Kompetitiver Charakter", en: "Competitive character" },
      { de: "Eye-Catcher an jedem Standort", en: "Eye-catcher at any location" },
    ],
    faq: [
      {
        question: { de: "Braucht man einen Hammer?", en: "Do you need a hammer?" },
        answer: { de: "Nein, die elektronische Version misst die Kraft über ein Polster – kein Hammer nötig, daher deutlich sicherer.", en: "No, the electronic version measures force via a pad – no hammer needed, making it much safer." }
      },
    ],
    included: [
      { de: "1x Hau den Lukas komplett montiert", en: "1x High Striker fully assembled" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
      { de: "2x Schlüssel", en: "2x Keys" },
    ],
    roiMonths: 5,
    lifestyleImage: "/images/products/lifestyle/hau-den-lukas-festival.jpg",
  },

  "air-hockey": {
    longDescription: {
      de: "Der Air Hockey Tisch im Space-Design ist ein echter Hingucker. Mit LED-Beleuchtung, elektronischem Punktezähler und Timer bietet er ein vollwertiges Spielerlebnis. Das Flying Hockey Space-Ship-Theme macht ihn besonders attraktiv für jüngere Zielgruppen.",
      en: "The Air Hockey table with space design is a real eye-catcher. With LED lighting, electronic score counter, and timer, it offers a complete gaming experience. The Flying Hockey spaceship theme makes it especially attractive to younger audiences."
    },
    features: [
      { de: "Space-Design mit LED-Beleuchtung", en: "Space design with LED lighting" },
      { de: "Elektronischer Punktezähler und Timer", en: "Electronic score counter and timer" },
      { de: "Hochwertige Spielfläche mit Luftstrom", en: "High-quality playing surface with airflow" },
      { de: "Münzbetrieben", en: "Coin-operated" },
      { de: "Rollen für einfaches Verschieben", en: "Wheels for easy repositioning" },
    ],
    useCases: [
      { de: "Arcades & Spielhallen", en: "Arcades & Game Centers" },
      { de: "Shoppingcenter", en: "Shopping Centers" },
      { de: "Freizeitparks", en: "Amusement Parks" },
      { de: "Restaurants & Bars", en: "Restaurants & Bars" },
    ],
    benefits: [
      { de: "Auffälliges Space-Design", en: "Eye-catching space design" },
      { de: "Zwei-Spieler-Spaß", en: "Two-player fun" },
      { de: "Mobil dank Rollen", en: "Mobile thanks to wheels" },
    ],
    faq: [
      {
        question: { de: "Ist der Tisch auf Rollen?", en: "Is the table on wheels?" },
        answer: { de: "Ja, der Tisch hat feststellbare Rollen für einfaches Umplatzieren.", en: "Yes, the table has lockable wheels for easy repositioning." }
      },
    ],
    included: [
      { de: "1x Air Hockey Tisch", en: "1x Air Hockey Table" },
      { de: "4x Pucks", en: "4x Pucks" },
      { de: "2x Schläger", en: "2x Strikers" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
    ],
    roiMonths: 5,
    lifestyleImage: "/images/products/lifestyle/air-hockey-arcade.jpg",
  },

  "air-hockey-premium": {
    longDescription: {
      de: "Der Air Hockey Premium Tisch setzt neue Maßstäbe in Qualität und Spielerlebnis. Die verstärkte Spielfläche, überlegene Luftstromtechnologie und dynamische LED-Beleuchtung schaffen ein unvergleichliches Spielerlebnis für Profis und Enthusiasten.",
      en: "The Air Hockey Premium Table sets new standards in quality and gaming experience. The reinforced playing surface, superior airflow technology, and dynamic LED lighting create an unparalleled gaming experience for pros and enthusiasts."
    },
    features: [
      { de: "Verstärkte Spielfläche für Profi-Einsatz", en: "Reinforced playing surface for professional use" },
      { de: "Überlegene Luftstromtechnologie", en: "Superior airflow technology" },
      { de: "Dynamische RGB-LED-Beleuchtung", en: "Dynamic RGB LED lighting" },
      { de: "Premium-Materialien", en: "Premium materials" },
      { de: "Elektronische Punkteanzeige", en: "Electronic score display" },
    ],
    useCases: [
      { de: "Premium Arcades", en: "Premium Arcades" },
      { de: "Professionelle Turniere", en: "Professional Tournaments" },
      { de: "Gehobene Gastronomie", en: "Upscale Gastronomy" },
      { de: "VIP-Bereiche", en: "VIP Areas" },
    ],
    benefits: [
      { de: "Höchste Qualitätsstufe", en: "Highest quality level" },
      { de: "Turniergeeignete Spielfläche", en: "Tournament-grade playing surface" },
      { de: "Beeindruckende RGB-Lightshow", en: "Impressive RGB light show" },
    ],
    faq: [
      {
        question: { de: "Worin liegt der Unterschied zum Standard-Tisch?", en: "What's the difference from the standard table?" },
        answer: { de: "Der Premium-Tisch bietet eine verstärkte Spielfläche, besseren Luftstrom und RGB-LED-Beleuchtung. Er ist für den intensiven Dauerbetrieb in professionellen Umgebungen konzipiert.", en: "The premium table offers a reinforced playing surface, better airflow, and RGB LED lighting. It's designed for intensive continuous operation in professional environments." }
      },
    ],
    included: [
      { de: "1x Air Hockey Premium Tisch", en: "1x Air Hockey Premium Table" },
      { de: "6x Premium-Pucks", en: "6x Premium pucks" },
      { de: "2x Profi-Schläger", en: "2x Professional strikers" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
    ],
    roiMonths: 6,
    lifestyleImage: "/images/products/lifestyle/air-hockey-arcade.jpg",
  },

  "basketball-arcade": {
    longDescription: {
      de: "Die Basketball Arcade ist die professionelle Variante unserer Basketball-Automaten. Mit Neon-LED-Beleuchtung, elektronischem Punktezähler und Multiplayer-Modus bietet sie ein erstklassiges Spielerlebnis. Ideal für Spielhallen und Unterhaltungszentren mit hohem Qualitätsanspruch.",
      en: "The Basketball Arcade is the professional variant of our basketball machines. With neon LED lighting, electronic score counter, and multiplayer mode, it offers a first-class gaming experience. Ideal for game centers and entertainment venues with high quality standards."
    },
    features: [
      { de: "Professionelle Neon-LED-Beleuchtung", en: "Professional neon LED lighting" },
      { de: "Elektronischer Punktezähler", en: "Electronic score counter" },
      { de: "Multiplayer-Modus", en: "Multiplayer mode" },
      { de: "Verstärkter Stahlrahmen", en: "Reinforced steel frame" },
      { de: "Automatischer Ballrücklauf", en: "Automatic ball return" },
    ],
    useCases: [
      { de: "Spielhallen", en: "Game Centers" },
      { de: "Unterhaltungszentren", en: "Entertainment Centers" },
      { de: "Events", en: "Events" },
      { de: "Freizeitparks", en: "Amusement Parks" },
    ],
    benefits: [
      { de: "Professionelle Ausführung", en: "Professional build" },
      { de: "Hohe Spielmotivation", en: "High replay motivation" },
      { de: "Robuste Dauerbetrieb-Qualität", en: "Robust continuous operation quality" },
    ],
    faq: [
      {
        question: { de: "Wie unterscheidet sich die Arcade von der Standard Basketball Machine?", en: "How does the Arcade differ from the standard Basketball Machine?" },
        answer: { de: "Die Arcade-Version bietet eine größere Spielfläche, verstärkten Rahmen und professionellere LED-Beleuchtung für den anspruchsvollen Einsatz.", en: "The Arcade version offers a larger play area, reinforced frame, and more professional LED lighting for demanding use." }
      },
    ],
    included: [
      { de: "1x Basketball Arcade komplett montiert", en: "1x Basketball Arcade fully assembled" },
      { de: "4x Arcade-Basketbälle", en: "4x Arcade basketballs" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
      { de: "2x Schlüssel", en: "2x Keys" },
    ],
    roiMonths: 4,
    lifestyleImage: "/images/products/lifestyle/basketball-arcade.jpg",
  },

  "champions-league-tischkicker": {
    longDescription: {
      de: "Der Champions League Tischkicker vereint Premium-Qualität mit dem offiziellen Champions League Design. Das schwarze Hochglanz-Finish, die detaillierten Spielfiguren und die robuste Bauweise machen ihn zum Highlight in jeder Gastronomie, jedem Büro und jeder Spielhalle.",
      en: "The Champions League Foosball Table combines premium quality with the official Champions League design. The black high-gloss finish, detailed player figures, and robust construction make it the highlight of any restaurant, office, or game center."
    },
    features: [
      { de: "Offizielles Champions League Design", en: "Official Champions League design" },
      { de: "Schwarzes Hochglanz-Finish", en: "Black high-gloss finish" },
      { de: "Detaillierte Spielfiguren", en: "Detailed player figures" },
      { de: "Gehärtete Spielstangen", en: "Hardened playing rods" },
      { de: "Kein Strom benötigt", en: "No electricity needed" },
    ],
    useCases: [
      { de: "Gastronomie & Bars", en: "Restaurants & Bars" },
      { de: "Büros & Pausenräume", en: "Offices & Break Rooms" },
      { de: "Spielhallen", en: "Game Centers" },
      { de: "Jugendeinrichtungen", en: "Youth Facilities" },
    ],
    benefits: [
      { de: "Kein Strom benötigt = überall aufstellbar", en: "No electricity needed = place anywhere" },
      { de: "Champions League Lizenz = Premium-Image", en: "Champions League license = premium image" },
      { de: "Zeitloses Spielerlebnis", en: "Timeless gaming experience" },
    ],
    faq: [
      {
        question: { de: "Kann der Kicker münzbetrieben werden?", en: "Can the table be coin-operated?" },
        answer: { de: "Ja, der Tischkicker verfügt über eine integrierte Münzmechanik.", en: "Yes, the foosball table features an integrated coin mechanism." }
      },
    ],
    included: [
      { de: "1x Champions League Tischkicker", en: "1x Champions League Foosball Table" },
      { de: "Spielbälle", en: "Playing balls" },
      { de: "2x Schlüssel", en: "2x Keys" },
    ],
    roiMonths: 6,
    lifestyleImage: "/images/products/lifestyle/foosball-office.jpg",
  },

  "kinderkarussell": {
    longDescription: {
      de: "Das elektronische Kinderkarussell ist der perfekte Magnet für Familien mit kleinen Kindern. Mit bunter LED-Beleuchtung, fröhlicher Musik und sicherer Bauweise ist es die ideale Attraktion für Supermärkte, Einkaufszentren und Freizeitparks. Eltern schätzen die Sicherheit, Kinder lieben den Fahrspaß.",
      en: "The electronic kids carousel is the perfect magnet for families with small children. With colorful LED lighting, cheerful music, and safe construction, it's the ideal attraction for supermarkets, shopping centers, and amusement parks. Parents appreciate the safety, kids love the ride."
    },
    features: [
      { de: "Bunte LED-Beleuchtung", en: "Colorful LED lighting" },
      { de: "Fröhliche Musik mit Lautstärkeregelung", en: "Cheerful music with volume control" },
      { de: "Sichere Bauweise mit Sicherheitsgurten", en: "Safe construction with safety belts" },
      { de: "Münzbetrieben", en: "Coin-operated" },
      { de: "Mehrere Sitzplätze", en: "Multiple seats" },
    ],
    useCases: [
      { de: "Supermärkte & Kaufhäuser", en: "Supermarkets & Department Stores" },
      { de: "Einkaufszentren", en: "Shopping Centers" },
      { de: "Freizeitparks", en: "Amusement Parks" },
      { de: "Restaurants mit Kinderbereich", en: "Restaurants with Kids Area" },
    ],
    benefits: [
      { de: "Familien-Magnet für mehr Kunden", en: "Family magnet for more customers" },
      { de: "Sicher und geprüft", en: "Safe and certified" },
      { de: "Hohe Wiederspielrate", en: "High replay rate" },
    ],
    faq: [
      {
        question: { de: "Für welches Alter ist das Karussell geeignet?", en: "What age is the carousel suitable for?" },
        answer: { de: "Das Karussell ist für Kinder von 2-8 Jahren geeignet. Die Sicherheitsgurte sorgen für sicheren Fahrspaß.", en: "The carousel is suitable for children aged 2-8. Safety belts ensure safe riding fun." }
      },
    ],
    included: [
      { de: "1x Kinderkarussell komplett montiert", en: "1x Kids carousel fully assembled" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
      { de: "2x Schlüssel", en: "2x Keys" },
      { de: "1x Bedienungsanleitung", en: "1x User manual" },
    ],
    roiMonths: 6,
    lifestyleImage: "/images/products/lifestyle/kids-carousel-mall.jpg",
  },

  "parfuem-automat": {
    longDescription: {
      de: "Der Parfüm-Automat bringt Luxusdüfte direkt zum Kunden. Mit elegantem Touchscreen, integriertem Bezahlsystem und dem Premium Schwarz-Gold-Design ist er ideal für gehobene Standorte wie Hotels, Einkaufszentren und hochwertige Gastronomie.",
      en: "The Perfume Vending Machine brings luxury fragrances directly to customers. With elegant touchscreen, integrated payment system, and premium black-gold design, it's ideal for upscale locations like hotels, shopping centers, and fine dining."
    },
    features: [
      { de: "Touchscreen-Bedienung", en: "Touchscreen operation" },
      { de: "Integriertes Bezahlsystem (Münze, Schein, Karte)", en: "Integrated payment system (coin, bill, card)" },
      { de: "Premium Schwarz-Gold Design", en: "Premium black-gold design" },
      { de: "Temperaturgeregelte Aufbewahrung", en: "Temperature-controlled storage" },
      { de: "Kompakte Stellfläche", en: "Compact footprint" },
    ],
    useCases: [
      { de: "Hotels & Resorts", en: "Hotels & Resorts" },
      { de: "Einkaufszentren", en: "Shopping Centers" },
      { de: "Gehobene Gastronomie", en: "Fine Dining" },
      { de: "Clubs & Lounges", en: "Clubs & Lounges" },
    ],
    benefits: [
      { de: "Hochpreisiges Produkt = hohe Margen", en: "High-price product = high margins" },
      { de: "Elegantes Design für Premium-Standorte", en: "Elegant design for premium locations" },
      { de: "Geringer Platzbedarf", en: "Low space requirements" },
    ],
    faq: [
      {
        question: { de: "Welche Bezahlmethoden werden unterstützt?", en: "Which payment methods are supported?" },
        answer: { de: "Der Automat unterstützt Münzen, Geldscheine und kontaktloses Bezahlen per Karte.", en: "The machine supports coins, banknotes, and contactless card payment." }
      },
    ],
    included: [
      { de: "1x Parfüm-Automat", en: "1x Perfume vending machine" },
      { de: "1x Bezahlsystem komplett", en: "1x Complete payment system" },
      { de: "2x Schlüssel", en: "2x Keys" },
    ],
    roiMonths: 3,
    lifestyleImage: "/images/products/lifestyle/perfume-machine-hotel.jpg",
  },

  "snack-automat": {
    longDescription: {
      de: "Der Snack-Automat ist die professionelle Lösung für Verpflegung rund um die Uhr. Mit großem Fassungsvermögen, Touchscreen-Bedienung und flexiblem Bezahlsystem versorgt er Mitarbeiter, Schüler und Kunden mit Snacks und Getränken – 24 Stunden am Tag, 7 Tage die Woche.",
      en: "The Snack Vending Machine is the professional solution for 24/7 catering. With large capacity, touchscreen operation, and flexible payment system, it supplies employees, students, and customers with snacks and beverages – 24 hours a day, 7 days a week."
    },
    features: [
      { de: "Großes Fassungsvermögen für viele Produkte", en: "Large capacity for many products" },
      { de: "Touchscreen-Bedienung", en: "Touchscreen operation" },
      { de: "Flexibles Bezahlsystem (Münze, Schein, Karte, NFC)", en: "Flexible payment system (coin, bill, card, NFC)" },
      { de: "Kühlung für Getränke", en: "Cooling for beverages" },
      { de: "Fernwartung und Telemetrie möglich", en: "Remote monitoring and telemetry possible" },
    ],
    useCases: [
      { de: "Büros & Co-Working-Spaces", en: "Offices & Co-Working Spaces" },
      { de: "Schulen & Universitäten", en: "Schools & Universities" },
      { de: "Fitnessstudios", en: "Fitness Studios" },
      { de: "Krankenhäuser & öffentliche Einrichtungen", en: "Hospitals & Public Facilities" },
    ],
    benefits: [
      { de: "24/7 Umsatz ohne Personal", en: "24/7 revenue without staff" },
      { de: "Flexibel bestückbar", en: "Flexibly stockable" },
      { de: "Modernste Bezahltechnologie", en: "Latest payment technology" },
    ],
    faq: [
      {
        question: { de: "Wie viele Produkte passen in den Automaten?", en: "How many products fit in the machine?" },
        answer: { de: "Je nach Produktgröße bis zu 300 Artikel. Die Fächer sind individuell anpassbar.", en: "Up to 300 items depending on product size. Compartments are individually adjustable." }
      },
    ],
    included: [
      { de: "1x Snack-Automat komplett montiert", en: "1x Snack vending machine fully assembled" },
      { de: "1x Komplett-Bezahlsystem", en: "1x Complete payment system" },
      { de: "2x Schlüssel", en: "2x Keys" },
      { de: "1x Fernwartungs-Zugang", en: "1x Remote maintenance access" },
    ],
    roiMonths: 6,
    lifestyleImage: "/images/products/lifestyle/snack-machine-office.jpg",
  },

  "furby-car": {
    longDescription: {
      de: "Das Furby Car ist eine beliebte Kinderfahrt-Attraktion, die in Supermärkten, Kiosken und Einkaufszentren für Begeisterung bei den Kleinen sorgt. Die hochwertige Verarbeitung und der Münzbetrieb machen es zur idealen passiven Einkommensquelle.",
      en: "The Furby Car is a popular kids ride attraction that delights little ones in supermarkets, kiosks, and shopping centers. High-quality construction and coin operation make it the ideal passive income source."
    },
    features: [
      { de: "Hochwertige Verarbeitung", en: "High-quality construction" },
      { de: "Münzbetrieben", en: "Coin-operated" },
      { de: "Bunte LED-Beleuchtung", en: "Colorful LED lighting" },
      { de: "Fröhliche Musik", en: "Cheerful music" },
      { de: "Sicherheitsgurt", en: "Safety belt" },
    ],
    useCases: [
      { de: "Supermärkte", en: "Supermarkets" },
      { de: "Kioske & Spätis", en: "Kiosks & Convenience Stores" },
      { de: "Einkaufszentren", en: "Shopping Centers" },
      { de: "Spielplätze & Parks", en: "Playgrounds & Parks" },
    ],
    benefits: [
      { de: "Kinder-Magnet für mehr Kundenfrequenz", en: "Kids magnet for more customer traffic" },
      { de: "Passives Einkommen", en: "Passive income" },
      { de: "Einfache Aufstellung", en: "Easy setup" },
    ],
    faq: [
      {
        question: { de: "Für welches Alter ist das Furby Car geeignet?", en: "What age is the Furby Car suitable for?" },
        answer: { de: "Das Furby Car ist für Kinder von 1-6 Jahren geeignet.", en: "The Furby Car is suitable for children aged 1-6." }
      },
    ],
    included: [
      { de: "1x Furby Car komplett montiert", en: "1x Furby Car fully assembled" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
      { de: "2x Schlüssel", en: "2x Keys" },
    ],
    roiMonths: 5,
    lifestyleImage: "/images/products/lifestyle/helicopter-ride-supermarket.jpg",
  },

  "helicopter-ride": {
    longDescription: {
      de: "Der Helicopter Ride ist eine hochwertige elektronische Kinderfahrt im Helikopter-Design. Besonders beliebt bei Kindern und ideal für Supermärkte, Kioske und Einkaufszentren. Der Münzbetrieb sorgt für unkompliziertes passives Einkommen.",
      en: "The Helicopter Ride is a high-quality electronic kids ride with helicopter design. Especially popular with children and ideal for supermarkets, kiosks, and shopping centers. Coin operation ensures hassle-free passive income."
    },
    features: [
      { de: "Realistisches Helikopter-Design", en: "Realistic helicopter design" },
      { de: "Münzbetrieben", en: "Coin-operated" },
      { de: "LED-Beleuchtung", en: "LED lighting" },
      { de: "Sound-Effekte", en: "Sound effects" },
      { de: "Sicherheitsgurt", en: "Safety belt" },
    ],
    useCases: [
      { de: "Supermärkte", en: "Supermarkets" },
      { de: "Kioske", en: "Kiosks" },
      { de: "Einkaufszentren", en: "Shopping Centers" },
      { de: "Messen & Events", en: "Trade Fairs & Events" },
    ],
    benefits: [
      { de: "Sehr beliebt bei Kindern", en: "Very popular with children" },
      { de: "Passives Einkommen", en: "Passive income" },
      { de: "Robuste Bauweise", en: "Robust construction" },
    ],
    faq: [
      {
        question: { de: "Wie laut sind die Sound-Effekte?", en: "How loud are the sound effects?" },
        answer: { de: "Die Lautstärke lässt sich regulieren und an die Umgebung anpassen.", en: "The volume is adjustable and can be adapted to the environment." }
      },
    ],
    included: [
      { de: "1x Helicopter Ride komplett montiert", en: "1x Helicopter Ride fully assembled" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
      { de: "2x Schlüssel", en: "2x Keys" },
    ],
    roiMonths: 5,
    lifestyleImage: "/images/products/lifestyle/helicopter-ride-supermarket.jpg",
  },

  "electric-dino-ride": {
    longDescription: {
      de: "Der Electric Dino Ride ist die perfekte Attraktion für kleine Dinosaurier-Fans. Die robuste Bauweise und das attraktive Design machen ihn zum Hingucker an jedem Standort. Münzbetrieben für passives Einkommen in Supermärkten, Einkaufszentren und überall dort, wo Familien unterwegs sind.",
      en: "The Electric Dino Ride is the perfect attraction for little dinosaur fans. Robust construction and attractive design make it an eye-catcher at any location. Coin-operated for passive income in supermarkets, shopping centers, and anywhere families visit."
    },
    features: [
      { de: "Realistisches Dinosaurier-Design", en: "Realistic dinosaur design" },
      { de: "Münzbetrieben", en: "Coin-operated" },
      { de: "LED-Augen-Beleuchtung", en: "LED eye lighting" },
      { de: "Bewegung und Sound-Effekte", en: "Movement and sound effects" },
      { de: "Robuste Bauweise", en: "Robust construction" },
    ],
    useCases: [
      { de: "Supermärkte", en: "Supermarkets" },
      { de: "Einkaufszentren", en: "Shopping Centers" },
      { de: "Restaurants mit Kinderbereich", en: "Restaurants with Kids Area" },
      { de: "Freizeitparks", en: "Amusement Parks" },
    ],
    benefits: [
      { de: "Dino-Thema extrem beliebt bei Kindern", en: "Dino theme extremely popular with kids" },
      { de: "Robuste, langlebige Bauweise", en: "Robust, long-lasting construction" },
      { de: "Passives Einkommen", en: "Passive income" },
    ],
    faq: [
      {
        question: { de: "Wie schwer darf das Kind sein?", en: "What's the maximum child weight?" },
        answer: { de: "Der Dino Ride ist für Kinder bis 30 kg ausgelegt.", en: "The Dino Ride is designed for children up to 30 kg." }
      },
    ],
    included: [
      { de: "1x Electric Dino Ride komplett montiert", en: "1x Electric Dino Ride fully assembled" },
      { de: "1x Münzprüfer", en: "1x Coin validator" },
      { de: "2x Schlüssel", en: "2x Keys" },
    ],
    roiMonths: 5,
    lifestyleImage: "/images/products/lifestyle/dino-ride-mall.jpg",
  },
};

export const getSeoContent = (slug: string): ProductSeoContent | undefined => {
  return productSeoContent[slug];
};
