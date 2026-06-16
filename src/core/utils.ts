export const prefetchToolChunk = (toolId: string) => {
  // Client-side module prefetching hook
  const prebuiltSlugs: Record<string, string> = {
    merge: "merge-pdf",
    compress: "compress-pdf",
    split: "split-pdf",
    reorder: "reorder-pdf",
    extract: "extract-pages-pdf",
  };
  
  const slug = prebuiltSlugs[toolId];
  if (slug && typeof window !== "undefined") {
    // Gracefully prefetch or flag cache
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = `/${slug}`;
    document.head.appendChild(link);
  }
};
