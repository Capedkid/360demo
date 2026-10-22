import type { ImgHTMLAttributes } from "react";
import { pickSource, srcSet, type ImageAsset } from "@/lib/image-utils";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "width" | "height"> & {
  asset: ImageAsset;
  alt: string;
  /** Hint for the browser about rendered width, e.g. "(min-width: 768px) 50vw, 100vw" */
  sizes: string;
  priority?: boolean;
};

export function ResponsiveImage({ asset, alt, sizes, priority, className = "", style, ...rest }: Props) {
  const fallback = pickSource(asset, 1600);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- images are pre-optimised by scripts/optimize-media.mjs
    <img
      src={fallback.src}
      srcSet={srcSet(asset)}
      sizes={sizes}
      width={asset.width}
      height={asset.height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={`blur-img ${className}`}
      style={{ backgroundImage: `url(${asset.blur})`, ...style }}
      {...rest}
    />
  );
}
