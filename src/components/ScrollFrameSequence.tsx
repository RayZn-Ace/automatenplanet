import { useEffect, useRef } from "react";

interface Props {
  framesBase: string; // e.g. "/boxautomat-frames/f"
  frameCount: number;
  ext?: string; // "webp"
  width: number;
  height: number;
  className?: string;
  alt?: string;
}

const ScrollFrameSequence = ({
  framesBase,
  frameCount,
  ext = "webp",
  width,
  height,
  className,
  alt = "",
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(-1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(3, "0");
    const imgs: HTMLImageElement[] = [];
    let loaded = 0;
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = `${framesBase}${pad(i)}.${ext}`;
      img.onload = () => {
        loaded++;
        if (i === 1) drawFrame(0);
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;

    const drawFrame = (idx: number) => {
      const canvas = canvasRef.current;
      const img = imagesRef.current[idx];
      if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
      if (currentFrameRef.current === idx) return;
      currentFrameRef.current = idx;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // progress 0 when rect.top === vh (just entered bottom)
        // progress 1 when rect.top === -rect.height/2 (element scrolled so 50% above viewport top, still ≥50% visible)
        const range = vh + rect.height * 0.5;
        const traveled = vh - rect.top;
        let p = traveled / range;
        if (p < 0) p = 0;
        if (p > 1) p = 1;
        const idx = Math.min(frameCount - 1, Math.floor(p * frameCount));
        drawFrame(idx);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [framesBase, frameCount, ext]);

  return (
    <div ref={containerRef} className={className} role="img" aria-label={alt}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default ScrollFrameSequence;
