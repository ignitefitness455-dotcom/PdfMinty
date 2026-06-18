import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

export function OptimizedImage({ src, alt, className = "", loading = "lazy" }: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onLoad={() => setLoaded(true)}
      className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}

export default OptimizedImage;
