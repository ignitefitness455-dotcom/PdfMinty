import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export function Canonical() {
  const location = useLocation();
  const APP_URL = "https://pdfminty.com";
  const canonicalUrl = `${APP_URL}${location.pathname === "/" ? "" : location.pathname}`;
  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}

export default Canonical;
