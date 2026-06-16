import React from "react";

interface OptimizedImageProps {
  src: string;
  srcWebp?: string;
  alt: string;
  className?: string;
  sizes?: string;
  lazy?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  srcWebp,
  alt,
  className = "",
  sizes,
  lazy = true,
}) => {
  return (
    <picture>
      {srcWebp && <source srcSet={srcWebp} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        className={className}
        sizes={sizes}
        loading={lazy ? "lazy" : "eager"}
        referrerPolicy="no-referrer"
      />
    </picture>
  );
};
