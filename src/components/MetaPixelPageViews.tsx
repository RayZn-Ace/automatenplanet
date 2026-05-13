import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackMetaEvent } from "@/lib/metaPixel";

const MetaPixelPageViews = () => {
  const location = useLocation();
  useEffect(() => {
    trackMetaEvent("PageView");
  }, [location.pathname, location.search]);
  return null;
};

export default MetaPixelPageViews;
