import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageview } from "@/lib/analytics";

/**
 * Mounts once. Fires a pageview + page_exit per route change.
 * Skips the admin dashboard itself.
 */
const AnalyticsTracker = () => {
  const loc = useLocation();
  useEffect(() => {
    if (loc.pathname.startsWith("/admin") || loc.pathname.startsWith("/metriken") || loc.pathname.startsWith("/bestellungen")) return;
    trackPageview(loc.pathname + loc.search);
  }, [loc.pathname, loc.search]);
  return null;
};

export default AnalyticsTracker;
