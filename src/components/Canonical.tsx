import { SEO } from "./SEO";

/**
 * Backwards compatible alias for App.tsx to use the new enterprise-grade SEO architecture.
 */
export default function Canonical() {
  return <SEO />;
}
