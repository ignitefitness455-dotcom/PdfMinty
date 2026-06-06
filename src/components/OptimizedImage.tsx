import React, { useEffect } from "react";

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Source URL of the high-res WebP image format, if available */
  srcWebp?: string;
  /** Primary source URL of the fallback image format (PNG, JPG, etc.) */
  src: string;
  /** Responsive source sets for responsive device layouts */
  srcSetWebp?: string;
  /** Alternate text for accessibility. MANDATORY for Screen Readers! */
  alt: string;
  /** Sets HTML lazy-load strategy. True by default for performance. Set false for above-fold hero screens */
  lazy?: boolean;
  /** Preloads this image dynamically on mount if true. Highly effective for above-the-fold content */
  preload?: boolean;
}

/**
 * OptimizedImage is a high-performance image rendering component.
 * It strictly adheres to:
 * 1. WebP modern image delivery with standard format fallbacks (using <picture>)
 * 2. High-performance native browser lazy-loading for below-fold assets
 * 3. Responsive sizing grids via srcSet/sizes
 * 4. Absolute accessibility compliance with mandatory alternative text
 * 5. Dynamic document-head preloading for critical above-the-fold images
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  srcWebp,
  srcSetWebp,
  alt,
  lazy = true,
  preload = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  ...props
}) => {
  // Handle head preload injecting for critical above-fold assets
  useEffect(() => {
    if (!preload) return;

    const targetUrl = srcWebp || src;
    const isWebp = !!srcWebp;

    // Check if the link tag already exists to avoid redundant tags
    const existingLink = document.querySelector(`link[rel="preload"][href="${targetUrl}"]`);
    if (existingLink) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = targetUrl;
    if (isWebp) {
      if (srcSetWebp) link.imageSrcset = srcSetWebp;
      if (sizes) link.imageSizes = sizes;
    }

    document.head.appendChild(link);

    // Cleanup preload link on component teardown
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [preload, src, srcWebp, srcSetWebp, sizes]);

  // If no WebP source is provided, fallback directly to standard <img>
  if (!srcWebp) {
    return (
      <img
        src={src}
        alt={alt}
        loading={lazy ? "lazy" : "eager"}
        className={className}
        sizes={sizes}
        referrerPolicy="no-referrer"
        {...props}
      />
    );
  }

  return (
    <picture>
      {/* Modern High-Performance WebP format source */}
      <source
        srcSet={srcSetWebp || srcWebp}
        type="image/webp"
        sizes={sizes}
      />
      {/* Fallback Image Source */}
      <img
        src={src}
        alt={alt}
        loading={lazy ? "lazy" : "eager"}
        className={className}
        sizes={sizes}
        referrerPolicy="no-referrer"
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
