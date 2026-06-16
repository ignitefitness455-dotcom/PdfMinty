import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

export const Canonical: React.FC = () => {
  const { pathname } = useLocation();
  const canonicalUrl = `https://pdfminty.com${pathname === "/" ? "" : pathname}`;
  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};

export default Canonical;
