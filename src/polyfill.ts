// Browser Polyfills for legacy platform assumptions
if (typeof window !== "undefined") {
  (window as any).global = window;
  if (!(window as any).process) {
    (window as any).process = { env: {} };
  }
}
export {};
