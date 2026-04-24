import React, { useState, useRef, useEffect, useCallback, PointerEvent as ReactPointerEvent } from "react";
import { Helmet } from "react-helmet-async";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import handbuchElektronik from "@/assets/handbuch-elektronik.png";

const MIN_SCALE = 1;
const MAX_SCALE = 5;

type Pointer = { id: number; x: number; y: number };

type Hotspot = {
  id: string;
  label: string;
  description: string;
  // Position of the hotspot center as a fraction of the image (0..1).
  x: number;
  y: number;
  // Target zoom scale when this hotspot is opened.
  scale: number;
};

const HOTSPOTS: Hotspot[] = [
  { id: "ballwurfpumpe", label: "Ballwurfpumpe", description: "Anschluss der Ballwurfpumpe (oben links auf der Platine)", x: 0.28, y: 0.17, scale: 3.2 },
  { id: "display", label: "Display A & B", description: "Anschluss für die beiden Display-Module", x: 0.79, y: 0.17, scale: 3.2 },
  { id: "stromversorgung", label: "220V Strom", description: "Stromanschluss 220V (links auf der Platine)", x: 0.275, y: 0.45, scale: 3 },
  { id: "lautsprecher", label: "Lautsprecher", description: "Lautsprecher-Anschluss (links unter dem 220V-Anschluss)", x: 0.27, y: 0.535, scale: 3.2 },
  { id: "lautstaerke", label: "Lautstärke", description: "Drehregler für die Lautstärke", x: 0.34, y: 0.52, scale: 3.5 },
  { id: "dip", label: "DIP-Schalter", description: "System-Einstellungen – alle Schalter müssen auf OFF stehen", x: 0.435, y: 0.525, scale: 4 },
  { id: "torswitch", label: "Torschalter A & B", description: "Anschlüsse der Torschalter A und B", x: 0.515, y: 0.65, scale: 3.2 },
  { id: "muenz", label: "Münzeinwurf", description: "Anschluss für den Münzeinwurf", x: 0.62, y: 0.65, scale: 3.2 },
];

const Handbuch = () => {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  // Committed view – kept in state so React renders reflect the latest zoom/pan
  // when no gesture is active. During a gesture we mutate the DOM directly.
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Live values used inside event handlers (avoids stale closures and React renders).
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Active pointers (mouse / touch / pen).
  const pointersRef = useRef<Map<number, Pointer>>(new Map());

  // Gesture state – snapshots taken when the gesture starts/changes mode.
  const gestureRef = useRef<{
    mode: "none" | "pan" | "pinch";
    // pan
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    // pinch
    startDist: number;
    baseScale: number;
    // pinch anchor in image-local coordinates (independent of scale/offset)
    anchorImgX: number;
    anchorImgY: number;
    // pinch anchor in container coordinates (where the midpoint should stay)
    anchorScreenX: number;
    anchorScreenY: number;
  }>({
    mode: "none",
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
    startDist: 0,
    baseScale: 1,
    anchorImgX: 0,
    anchorImgY: 0,
    anchorScreenX: 0,
    anchorScreenY: 0,
  });

  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number; s: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number }>({ time: 0, x: 0, y: 0 });

  // Smooth keyboard panning: animate the offset toward a target position via rAF.
  const panTargetRef = useRef<{ x: number; y: number } | null>(null);
  const panRafRef = useRef<number | null>(null);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const applyTransform = useCallback((x: number, y: number, s: number) => {
    if (imgRef.current) {
      imgRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
    }
  }, []);

  const scheduleFrame = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const p = pendingRef.current;
      if (!p) return;
      applyTransform(p.x, p.y, p.s);
    });
  }, [applyTransform]);

  const commit = useCallback(
    (x: number, y: number, s: number) => {
      pendingRef.current = { x, y, s };
      scaleRef.current = s;
      offsetRef.current = { x, y };
      scheduleFrame();
    },
    [scheduleFrame],
  );

  const stopPanAnimation = useCallback(() => {
    if (panRafRef.current !== null) {
      cancelAnimationFrame(panRafRef.current);
      panRafRef.current = null;
    }
    panTargetRef.current = null;
  }, []);

  // Animate the image offset toward panTargetRef using a frame-rate independent
  // exponential ease-out. Each rAF tick pulls the current offset closer to the
  // target; new keypresses simply update the target while the loop is running.
  const runPanAnimation = useCallback(() => {
    if (panRafRef.current !== null) return;
    let lastTs: number | null = null;
    const tick = (ts: number) => {
      panRafRef.current = null;
      const target = panTargetRef.current;
      if (!target) return;
      const dt = lastTs === null ? 16 : Math.min(64, ts - lastTs);
      lastTs = ts;
      // Time constant ~80ms → snappy but visibly smooth.
      const alpha = 1 - Math.exp(-dt / 80);
      const cur = offsetRef.current;
      const dx = target.x - cur.x;
      const dy = target.y - cur.y;
      const nextX = Math.abs(dx) < 0.5 ? target.x : cur.x + dx * alpha;
      const nextY = Math.abs(dy) < 0.5 ? target.y : cur.y + dy * alpha;
      offsetRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY, scaleRef.current);
      if (nextX === target.x && nextY === target.y) {
        // Done – sync React state once so future renders match the DOM.
        setOffset({ x: nextX, y: nextY });
        panTargetRef.current = null;
        return;
      }
      panRafRef.current = requestAnimationFrame(tick);
    };
    panRafRef.current = requestAnimationFrame(tick);
  }, [applyTransform]);

  const resetView = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    pendingRef.current = null;
    stopPanAnimation();
    setScale(1);
    setOffset({ x: 0, y: 0 });
    applyTransform(0, 0, 1);
  }, [applyTransform, stopPanAnimation]);

  // Pending focus to apply once the dialog has mounted and the image is laid out.
  const pendingFocusRef = useRef<{ xPct: number; yPct: number; scale: number } | null>(null);

  const focusOn = useCallback(
    (xPct: number, yPct: number, targetScale: number) => {
      const img = imgRef.current;
      const container = containerRef.current;
      if (!img || !container) return;
      const cRect = container.getBoundingClientRect();
      // The image is rendered at its natural CSS size (max-w/max-h apply).
      // offsetWidth/Height give the laid-out (un-transformed) size.
      const w = img.offsetWidth;
      const h = img.offsetHeight;
      // Container-space coordinate (origin = container center) of the target
      // point on the un-transformed image.
      const localX = (xPct - 0.5) * w;
      const localY = (yPct - 0.5) * h;
      // After applying scale around the image center, that point lives at
      // (localX * s, localY * s). To bring it to the container center we need
      // an offset of -localX * s, -localY * s.
      const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, targetScale));
      const nx = -localX * s;
      const ny = -localY * s;
      // Constrain so we never reveal empty space outside the image.
      const maxX = ((w * s - cRect.width) / 2);
      const maxY = ((h * s - cRect.height) / 2);
      const clampedX = Math.max(-Math.max(maxX, 0), Math.min(Math.max(maxX, 0), nx));
      const clampedY = Math.max(-Math.max(maxY, 0), Math.min(Math.max(maxY, 0), ny));
      setScale(s);
      setOffset({ x: clampedX, y: clampedY });
      scaleRef.current = s;
      offsetRef.current = { x: clampedX, y: clampedY };
      applyTransform(clampedX, clampedY, s);
    },
    [applyTransform],
  );

  const openHotspot = (xPct: number, yPct: number, targetScale = 3) => {
    pendingFocusRef.current = { xPct, yPct, scale: targetScale };
    setZoomOpen(true);
  };

  // Apply pending focus once the dialog & image are in the DOM.
  useEffect(() => {
    if (!zoomOpen) return;
    const pending = pendingFocusRef.current;
    if (!pending) return;
    const img = imgRef.current;
    if (!img) return;
    const run = () => {
      focusOn(pending.xPct, pending.yPct, pending.scale);
      pendingFocusRef.current = null;
    };
    if (img.complete && img.naturalWidth > 0) {
      // Wait one frame so the dialog has finished its mount/layout animation.
      requestAnimationFrame(run);
    } else {
      img.addEventListener("load", () => requestAnimationFrame(run), { once: true });
    }
  }, [zoomOpen, focusOn]);

  const handleOpenChange = (open: boolean) => {
    setZoomOpen(open);
    if (open) {
      setShowHint(true);
    } else {
      setShowHint(false);
      pendingFocusRef.current = null;
      resetView();
    }
  };

  // Hint im Zoom-Dialog kurz einblenden und nach 3 Sekunden ausblenden
  useEffect(() => {
    if (!zoomOpen || !showHint) return;
    const t = window.setTimeout(() => setShowHint(false), 3000);
    return () => window.clearTimeout(t);
  }, [zoomOpen, showHint]);

  const zoomIn = () => {
    const next = Math.min(scaleRef.current + 0.5, MAX_SCALE);
    setScale(next);
    applyTransform(offsetRef.current.x, offsetRef.current.y, next);
  };
  const zoomOut = () => {
    const next = Math.max(scaleRef.current - 0.5, MIN_SCALE);
    const nextOffset = next === 1 ? { x: 0, y: 0 } : offsetRef.current;
    setScale(next);
    setOffset(nextOffset);
    applyTransform(nextOffset.x, nextOffset.y, next);
  };

  const getContainerPoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: clientX, y: clientY };
    return { x: clientX - rect.left - rect.width / 2, y: clientY - rect.top - rect.height / 2 };
  };

  const startPinch = () => {
    const pts = Array.from(pointersRef.current.values());
    if (pts.length < 2) return;
    const [a, b] = pts;
    const midClientX = (a.x + b.x) / 2;
    const midClientY = (a.y + b.y) / 2;
    const mid = getContainerPoint(midClientX, midClientY);
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    const s = scaleRef.current;
    const o = offsetRef.current;
    // Convert the container-space midpoint into "image-local" coordinates so we
    // can keep that exact point fixed under the fingers as scale changes.
    gestureRef.current = {
      ...gestureRef.current,
      mode: "pinch",
      startDist: dist,
      baseScale: s,
      anchorImgX: (mid.x - o.x) / s,
      anchorImgY: (mid.y - o.y) / s,
      anchorScreenX: mid.x,
      anchorScreenY: mid.y,
    };
    setIsDragging(true);
  };

  const startPan = (p: Pointer) => {
    if (scaleRef.current === 1) {
      gestureRef.current.mode = "none";
      return;
    }
    gestureRef.current = {
      ...gestureRef.current,
      mode: "pan",
      startX: p.x,
      startY: p.y,
      baseX: offsetRef.current.x,
      baseY: offsetRef.current.y,
    };
    setIsDragging(true);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { id: e.pointerId, x: e.clientX, y: e.clientY });

    // Double-tap / double-click to toggle zoom around tap point.
    if (pointersRef.current.size === 1) {
      const now = performance.now();
      const last = lastTapRef.current;
      const dt = now - last.time;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      if (dt < 300 && Math.hypot(dx, dy) < 30) {
        // double tap
        const target = scaleRef.current > 1 ? 1 : 2.5;
        if (target === 1) {
          setScale(1);
          setOffset({ x: 0, y: 0 });
          applyTransform(0, 0, 1);
        } else {
          // Zoom in around the tap point
          const tap = getContainerPoint(e.clientX, e.clientY);
          const s = scaleRef.current;
          const o = offsetRef.current;
          const imgX = (tap.x - o.x) / s;
          const imgY = (tap.y - o.y) / s;
          const newX = tap.x - imgX * target;
          const newY = tap.y - imgY * target;
          setScale(target);
          setOffset({ x: newX, y: newY });
          applyTransform(newX, newY, target);
          scaleRef.current = target;
          offsetRef.current = { x: newX, y: newY };
        }
        lastTapRef.current = { time: 0, x: 0, y: 0 };
        return;
      }
      lastTapRef.current = { time: now, x: e.clientX, y: e.clientY };
    }

    if (pointersRef.current.size === 2) {
      startPinch();
    } else if (pointersRef.current.size === 1) {
      const p = pointersRef.current.get(e.pointerId)!;
      startPan(p);
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const stored = pointersRef.current.get(e.pointerId);
    if (!stored) return;
    stored.x = e.clientX;
    stored.y = e.clientY;

    const g = gestureRef.current;

    if (g.mode === "pinch" && pointersRef.current.size >= 2) {
      const pts = Array.from(pointersRef.current.values()).slice(0, 2);
      const [a, b] = pts;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (g.startDist === 0) return;
      const ratio = dist / g.startDist;
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, g.baseScale * ratio));
      // Keep the original anchor point pinned under the fingers.
      const newX = g.anchorScreenX - g.anchorImgX * nextScale;
      const newY = g.anchorScreenY - g.anchorImgY * nextScale;
      commit(newX, newY, nextScale);
    } else if (g.mode === "pan") {
      const x = g.baseX + (stored.x - g.startX);
      const y = g.baseY + (stored.y - g.startY);
      commit(x, y, scaleRef.current);
    }
  };

  const endPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    const g = gestureRef.current;
    const remaining = pointersRef.current.size;

    if (g.mode === "pinch" && remaining < 2) {
      // Commit the pinch and either continue panning with the remaining finger
      // or end the gesture.
      const finalScale = scaleRef.current;
      const finalOffset = offsetRef.current;
      // If we zoomed back to 1, snap the offset to center.
      if (finalScale <= MIN_SCALE) {
        setScale(MIN_SCALE);
        setOffset({ x: 0, y: 0 });
        applyTransform(0, 0, MIN_SCALE);
      } else {
        setScale(finalScale);
        setOffset(finalOffset);
      }
      if (remaining === 1) {
        const p = Array.from(pointersRef.current.values())[0];
        startPan(p);
      } else {
        gestureRef.current.mode = "none";
        setIsDragging(false);
      }
      return;
    }

    if (g.mode === "pan" && remaining === 0) {
      const finalOffset = offsetRef.current;
      setOffset(finalOffset);
      gestureRef.current.mode = "none";
      setIsDragging(false);
    }
  };

  // Cleanup any pending frame on unmount.
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Keyboard controls inside the zoom dialog.
  // Esc is handled natively by Radix Dialog – we add +/- for zoom and arrows for panning.
  const onDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key;
    if (key === "+" || key === "=") {
      e.preventDefault();
      zoomIn();
      return;
    }
    if (key === "-" || key === "_") {
      e.preventDefault();
      zoomOut();
      return;
    }
    if (key === "0") {
      e.preventDefault();
      resetView();
      return;
    }
    if (
      key === "ArrowUp" ||
      key === "ArrowDown" ||
      key === "ArrowLeft" ||
      key === "ArrowRight"
    ) {
      if (scaleRef.current === 1) return;
      e.preventDefault();
      const step = e.shiftKey ? 120 : 40;
      let dx = 0;
      let dy = 0;
      if (key === "ArrowUp") dy = step;
      if (key === "ArrowDown") dy = -step;
      if (key === "ArrowLeft") dx = step;
      if (key === "ArrowRight") dx = -step;
      const nextX = offsetRef.current.x + dx;
      const nextY = offsetRef.current.y + dy;
      setOffset({ x: nextX, y: nextY });
      offsetRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY, scaleRef.current);
    }
  };


  return (
    <>
      <Helmet>
        <title>Handbuch Tischkicker Pro CL | AutomatPlanet.de</title>
        <meta
          name="description"
          content="Benutzer-Handbuch für den Tischkicker Pro CL: Montage, Inbetriebnahme, Spielanleitung, Wartung und technische Daten."
        />
        <link rel="canonical" href="https://automatplanet.de/handbuch" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://automatplanet.de/handbuch" />
        <meta property="og:title" content="Handbuch Tischkicker Pro CL | AutomatPlanet.de" />
        <meta
          property="og:description"
          content="Benutzer-Handbuch für den Tischkicker Pro CL: Montage, Inbetriebnahme, Spielanleitung, Wartung und technische Daten."
        />
        <meta property="og:image" content="https://automatplanet.de/images/og/og-default.jpg" />
        <meta property="og:site_name" content="AutomatPlanet" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <header className="mb-10">
            <p className="text-sm uppercase tracking-widest text-primary mb-2">Benutzer-Handbuch</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Tischkicker Pro CL</h1>
            <div className="text-muted-foreground text-sm leading-relaxed">
              <p className="font-semibold text-foreground">SMEA GmbH</p>
              <p>Kothöferdamm 7, 30177 Hannover</p>
              <p>
                📧{" "}
                <a href="mailto:kontakt@smea.info" className="text-primary hover:underline">
                  kontakt@smea.info
                </a>
                {" "}· 🌐{" "}
                <a href="https://automatplanet.de" className="text-primary hover:underline">
                  automatplanet.de
                </a>
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <a
                  href="/downloads/handbuch-tischkicker-pro-cl.pdf"
                  download
                  aria-label="Handbuch Tischkicker Pro CL als PDF herunterladen"
                >
                  <Download className="h-5 w-5" />
                  Handbuch als PDF herunterladen
                </a>
              </Button>
            </div>
          </header>

          <section className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">1. Einleitung</h2>
              <p>
                Der Tischkicker Pro CL ist ein professioneller Kickertisch mit elektronischer
                Steuerung, Münzeinwurf und automatischer Ballausgabe.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">🛠️ 2. Montage & Inbetriebnahme</h2>
              <p>
                Die Maschine wird betriebsbereit geliefert. Lediglich die Standfüße müssen
                montiert werden.
              </p>
              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Montage der Füße</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Pro Fuß: 4 Schrauben + Unterlegscheiben verwenden</li>
                <li>Schrauben befinden sich in der Kasse der Maschine</li>
                <li>Tisch auf eine weiche Unterlage legen (Schutz vor Kratzern)</li>
              </ul>
              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Inbetriebnahme</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Gewünschte Anzahl Bälle in den Ballkanal legen</li>
                <li>Gerät an 220V Strom anschließen</li>
                <li>Spiel starten</li>
              </ul>
              <p className="mt-3">👉 Die Bälle befinden sich ebenfalls in der Kasse.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">🎮 3. Spielanleitung</h2>
              <p><strong className="text-foreground">Standard:</strong> 11 Bälle → Sieg bei 6 Toren</p>
              <p className="mt-2 font-semibold text-foreground">Alternative Spielmodi:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>9 Bälle → Sieg bei 5 Toren</li>
                <li>7 Bälle → Sieg bei 4 Toren</li>
              </ul>
              <p className="mt-3">👉 Weitere Bälle dienen als Ersatz.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">⚙️ 4. Elektronik & Anschlüsse</h2>
              <p>Die Steuerplatine verfügt über folgende Anschlüsse:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>220V Stromanschluss</li>
                <li>Lautsprecheranschluss</li>
                <li>Lautstärkeregler</li>
                <li>Münzeinwurf-Anschluss</li>
                <li>Torschalter A & B</li>
                <li>Display-Anschluss</li>
                <li>Ballwurfpumpe Anschluss</li>
                <li>Systemeinstellungen (DIP-Schalter)</li>
              </ul>
              <div className="mt-4 p-4 border-l-4 border-primary bg-primary/5 rounded">
                <p className="font-semibold text-foreground">⚠️ Wichtig:</p>
                <p>Alle DIP-Schalter müssen auf OFF stehen, sonst sperrt sich das System.</p>
              </div>
              <figure className="mt-6 -mx-4 sm:mx-0">
                <div className="group relative block w-full overflow-hidden sm:rounded-lg border-y sm:border border-white/10 bg-black/20">
                  <img
                    src={handbuchElektronik}
                    alt="Steuerplatine des Tischkicker Pro CL mit beschrifteten Anschlüssen: 220V Strom, Lautsprecher, Lautstärkeregler, DIP-Schalter (System-Einstellung), Torschalter A & B, Münzeinwurf, Display A & B und Ballwurfpumpe"
                    loading="lazy"
                    decoding="async"
                    width={1600}
                    height={1300}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 768px"
                    className="block w-full h-auto object-contain"
                  />

                  {/* Hotspots over the board image */}
                  {HOTSPOTS.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => openHotspot(h.x, h.y, h.scale)}
                      aria-label={`${h.label} – Detailansicht öffnen: ${h.description}`}
                      title={h.label}
                      className="absolute -translate-x-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/90 text-primary-foreground text-xs font-bold shadow-lg ring-2 ring-background/80 hover:scale-125 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform animate-pulse hover:animate-none"
                      style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}
                    >
                      <span className="sr-only">{h.label}</span>
                      <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 mx-auto" aria-hidden="true" />
                    </button>
                  ))}

                  {/* Open fullscreen (without hotspot focus) */}
                  <button
                    type="button"
                    onClick={() => setZoomOpen(true)}
                    aria-label="Steuerplatine des Tischkicker Pro CL vergrößern – Vollbild-Detailansicht öffnen"
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 inline-flex items-center gap-1 rounded-md bg-black/70 hover:bg-black/85 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                    Vollbild
                  </button>
                </div>
                <figcaption className="text-xs text-muted-foreground mt-2 px-4 sm:px-0 text-center">
                  Steuerplatine des Tischkicker Pro CL – tippen Sie auf einen Punkt, um direkt zum Bauteil zu zoomen.
                </figcaption>

                {/* Hotspot legend / quick links – also accessible without hovering tiny dots */}
                <ul className="mt-3 px-4 sm:px-0 flex flex-wrap gap-2 justify-center">
                  {HOTSPOTS.map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => openHotspot(h.x, h.y, h.scale)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 hover:bg-primary/15 px-3 py-1 text-xs text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <ZoomIn className="h-3 w-3 text-primary" aria-hidden="true" />
                        {h.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </figure>

              <Dialog open={zoomOpen} onOpenChange={handleOpenChange}>
                <DialogContent
                  className="max-w-[100vw] sm:max-w-[95vw] w-screen sm:w-[95vw] h-[100dvh] sm:h-[90vh] p-0 overflow-hidden bg-background rounded-none sm:rounded-lg focus:outline-none"
                  onKeyDown={onDialogKeyDown}
                >
                  <DialogTitle className="sr-only">Steuerplatine – Zoom-Ansicht</DialogTitle>
                  <DialogDescription className="sr-only">
                    Detailansicht der Steuerplatine. Tastatur: Plus und Minus zum Zoomen, Pfeiltasten zum Verschieben, 0 zum Zurücksetzen, Escape zum Schließen.
                  </DialogDescription>
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-wrap gap-1.5 sm:gap-2">
                    <Button size="icon" variant="secondary" onClick={zoomIn} aria-label="Vergrößern">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" onClick={zoomOut} aria-label="Verkleinern">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" onClick={resetView} aria-label="Ansicht zurücksetzen">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <span className="inline-flex items-center rounded-md bg-secondary px-2.5 sm:px-3 text-xs text-secondary-foreground">
                      {Math.round(scale * 100)}%
                    </span>
                  </div>
                  <div
                    ref={containerRef}
                    className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black/40 select-none touch-none"
                    style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endPointer}
                    onPointerCancel={endPointer}
                    onPointerLeave={endPointer}
                  >
                    {/* Kurzanleitung – wird beim Öffnen gezeigt und nach 3s automatisch ausgeblendet */}
                    <div
                      className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4 transition-opacity duration-500 ${
                        showHint ? "opacity-100" : "opacity-0"
                      }`}
                      aria-hidden={!showHint}
                    >
                      <div className="max-w-sm rounded-xl bg-black/75 text-white backdrop-blur-md px-4 py-3 shadow-lg text-center text-sm leading-relaxed">
                        <p className="font-medium mb-1">So nutzen Sie die Zoom-Ansicht</p>
                        <p className="hidden md:block opacity-90">
                          Mit <kbd className="px-1 py-0.5 rounded bg-white/15 font-mono text-xs">+</kbd>/<kbd className="px-1 py-0.5 rounded bg-white/15 font-mono text-xs">−</kbd> zoomen,
                          mit den Pfeiltasten verschieben. Im vergrößerten Zustand können Sie das Bild mit der Maus ziehen.
                        </p>
                        <p className="md:hidden opacity-90">
                          Mit zwei Fingern zoomen, doppeltippen für Schnellzoom. Vergrößertes Bild lässt sich mit dem Finger ziehen.
                        </p>
                      </div>
                    </div>
                    <img
                      ref={imgRef}
                      src={handbuchElektronik}
                      alt="Steuerplatine des Tischkicker Pro CL mit beschrifteten Anschlüssen: 220V Strom, Lautsprecher, Lautstärkeregler, DIP-Schalter (System-Einstellung), Torschalter A & B, Münzeinwurf, Display A & B und Ballwurfpumpe – Detailansicht"
                      draggable={false}
                      className={`max-w-[95vw] max-h-[80dvh] sm:max-h-[85vh] w-auto h-auto object-contain ${
                        isDragging ? "" : "transition-transform duration-150 ease-out"
                      }`}
                      style={{
                        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
                        transformOrigin: "center center",
                        willChange: "transform",
                        backfaceVisibility: "hidden",
                      }}
                    />
                    <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs backdrop-blur-sm pointer-events-none">
                      Mit zwei Fingern zoomen · Doppeltippen für Schnellzoom
                    </div>
                    <div className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs backdrop-blur-sm pointer-events-none">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/15 font-mono">+</kbd>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/15 font-mono">−</kbd>
                      <span>Zoom</span>
                      <span className="opacity-50">·</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/15 font-mono">↑↓←→</kbd>
                      <span>Verschieben</span>
                      <span className="opacity-50">·</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/15 font-mono">0</kbd>
                      <span>Reset</span>
                      <span className="opacity-50">·</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/15 font-mono">Esc</kbd>
                      <span>Schließen</span>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">⚠️ 5. Sicherheitshinweise</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Aufbau mit mindestens 2 Personen</li>
                <li>Nicht für Kinder unter 3 Jahren geeignet</li>
                <li>Nutzung nur unter Aufsicht von Erwachsenen</li>
                <li>Nicht auf den Tisch setzen oder klettern</li>
                <li>Gerät nicht als Ablage verwenden</li>
                <li>Nur auf stabilem, ebenem Untergrund aufstellen</li>
                <li>Vor direkter Sonneneinstrahlung schützen</li>
              </ul>
              <p className="mt-3">👉 Tisch niemals schieben – immer tragen (2 Personen).</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">🔧 6. Wartung & Pflege</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Reinigung: nur mit trockenem oder leicht feuchtem Tuch</li>
                <li>Keine aggressiven Reinigungsmittel verwenden</li>
                <li>Metallstangen alle 6 Monate fetten (Vaseline)</li>
                <li>Regelmäßige Kontrolle auf Schäden</li>
              </ul>
              <div className="mt-4 p-4 border-l-4 border-destructive bg-destructive/5 rounded">
                <p className="font-semibold text-foreground">⚠️ Bei Defekten:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Gerät sofort außer Betrieb nehmen</li>
                  <li>Keine eigenständigen Reparaturen durchführen</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">📦 7. Lagerung</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Trocken und geschützt lagern</li>
                <li>Keine extreme Hitze oder Feuchtigkeit</li>
                <li>So lagern, dass keine Verletzungsgefahr entsteht</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">📊 8. Technische Daten</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-white/10 rounded">
                  <tbody className="divide-y divide-white/10">
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground w-1/2">Modell</th>
                      <td className="py-2 px-3">Tischkicker Pro CL</td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground">Artikelnummer</th>
                      <td className="py-2 px-3">2025504</td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground">Gewicht</th>
                      <td className="py-2 px-3">ca. 70 kg</td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground">Spielfläche</th>
                      <td className="py-2 px-3">ca. 118 x 68 cm</td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground">Maße</th>
                      <td className="py-2 px-3">ca. 135 x 77 x 90 cm</td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground">Stromversorgung</th>
                      <td className="py-2 px-3">220V</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-l-4 border-primary bg-primary/5 rounded">
              <p className="font-semibold text-foreground">💣 Wichtiger Hinweis</p>
              <p>👉 Keine baulichen Veränderungen vornehmen</p>
              <p>👉 Nur Original-Ersatzteile verwenden</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">📞 Support</h2>
              <p>Bei Fragen oder Problemen:</p>
              <p className="mt-2">
                <span className="font-semibold text-foreground">SMEA GmbH</span>
                <br />
                📧{" "}
                <a href="mailto:kontakt@smea.info" className="text-primary hover:underline">
                  kontakt@smea.info
                </a>
                <br />
                🌐{" "}
                <a href="https://automatplanet.de" className="text-primary hover:underline">
                  automatplanet.de
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Handbuch;
