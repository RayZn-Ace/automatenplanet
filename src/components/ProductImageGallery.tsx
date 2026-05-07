import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { shopifyFetchProductImages, type ShopifyImage } from "@/lib/shopify";

interface Props {
  handle: string;
  fallbackImage: string;
  alt: string;
  badge?: React.ReactNode;
}

const ProductImageGallery = ({ handle, fallbackImage, alt, badge }: Props) => {
  const [images, setImages] = useState<ShopifyImage[]>([
    { url: fallbackImage, altText: alt },
  ]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const imgs = await shopifyFetchProductImages(handle);
      if (cancelled) return;
      if (imgs.length > 0) {
        setImages(imgs);
        setActive(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  const total = images.length;
  const current = images[active] ?? images[0];
  const go = (delta: number) =>
    setActive((i) => (i + delta + total) % total);

  // Touch swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) =>
    setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const dx = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    setTouchStart(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 aspect-square flex items-center justify-center overflow-hidden group"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          key={current.url}
          src={current.url}
          alt={current.altText || alt}
          className="w-full h-full object-contain p-6 animate-fade-in"
          loading="eager"
        />

        {badge && <div className="absolute top-4 left-4">{badge}</div>}

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Vorheriges Bild"
              onClick={() => go(-1)}
              className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Nächstes Bild"
              onClick={() => go(1)}
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Mobile counter */}
            <div className="md:hidden absolute bottom-3 right-3 rounded-full bg-background/80 backdrop-blur border border-border px-2.5 py-1 text-xs font-medium">
              {active + 1} / {total}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x scrollbar-thin">
          {images.map((img, i) => {
            const isActive = i === active;
            return (
              <button
                key={img.url + i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Bild ${i + 1} ansehen`}
                className={`shrink-0 snap-start h-16 w-16 md:h-20 md:w-20 rounded-lg border-2 overflow-hidden bg-background/50 transition-all ${
                  isActive
                    ? "border-primary shadow-neon"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.altText || `${alt} – Bild ${i + 1}`}
                  className="w-full h-full object-contain p-1"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
