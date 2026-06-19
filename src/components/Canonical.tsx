import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SITE_URL } from "../config/routes";

export function Canonical() {
  const location = useLocation();
  let pathname = location.pathname;

  // Route-to-canonical mapping/alias
  if (pathname === "/organize") {
    pathname = "/delete-pages-pdf";
  }

  const canonicalUrl = `${SITE_URL}${pathname === "/" ? "" : pathname}`;
  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}

export default Canonical;
