import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Anker nach dem Routenwechsel anspringen (z.B. /#showroom aus dem Footer).
      const id = hash.slice(1);
      const scroll = () => {
        const el = document.getElementById(id);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      };
      const t = window.setTimeout(scroll, 120);
      return () => window.clearTimeout(t);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);
  return null;
};

export default ScrollToTop;
