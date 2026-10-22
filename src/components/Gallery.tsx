"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { pickSource, type ImageAsset } from "@/lib/image-utils";
import { ResponsiveImage } from "./ResponsiveImage";
import { RevealImage } from "./Reveal";

const LightboxModal = dynamic(() => import("./LightboxModal"), { ssr: false });

export type GalleryImage = { asset: ImageAsset; caption: string };

type Tile = { mobile: string; desktop: string; sizes: string };

const BIG = "66vw";
const THIRD = "33vw";
const HALF = "50vw";

/**
 * Editorial grid: groups of six (one large image + five smaller), and a tail
 * that always fills its last row, so any number of images lays out cleanly.
 */
function layout(count: number): Tile[] {
  const desktop: { cls: string; sizes: string }[] = [];
  let i = 0;
  let group = 0;
  while (count - i >= 6) {
    const flip = group % 2 === 1;
    desktop.push({ cls: `md:col-span-8 md:row-span-2 ${flip ? "md:col-start-5" : ""}`, sizes: BIG });
    for (let k = 0; k < 5; k++) desktop.push({ cls: "md:col-span-4", sizes: THIRD });
    i += 6;
    group++;
  }
  const rest = count - i;
  const tail: Record<number, number[]> = { 1: [12], 2: [6, 6], 3: [4, 4, 4], 4: [6, 6, 6, 6], 5: [6, 6, 4, 4, 4] };
  for (const span of tail[rest] ?? []) {
    desktop.push({
      cls: span === 12 ? "md:col-span-12" : span === 6 ? "md:col-span-6" : "md:col-span-4",
      sizes: span === 12 ? "100vw" : span === 6 ? HALF : THIRD,
    });
  }

  // Mobile: two columns, every third tile full width; never leave a lone half tile at the end
  return desktop.map((d, idx) => {
    const wide = idx % 3 === 0 || (idx === count - 1 && (idx - 1) % 3 === 0);
    return {
      desktop: d.cls,
      sizes: `(min-width: 768px) ${d.sizes}, ${wide ? "100vw" : "50vw"}`,
      mobile: wide ? "col-span-2 aspect-[3/2]" : "col-span-1 aspect-[4/5]",
    };
  });
}

type Props = {
  images: GalleryImage[];
  /** Section name used in accessible labels, e.g. "Exterior" */
  label: string;
};

export function Gallery({ images, label }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const tiles = layout(images.length);

  const slides = images.map(({ asset, caption }) => {
    const largest = pickSource(asset, 2400);
    return {
      src: largest.src,
      width: largest.width,
      height: largest.height,
      alt: caption,
      // Shown at the bottom; the top-left corner is taken by the counter
      description: caption,
      srcSet: asset.sources,
    };
  });

  return (
    <>
      <ul className="grid grid-flow-dense grid-cols-2 gap-2 md:grid-cols-12 md:auto-rows-[clamp(200px,22vw,360px)] md:gap-3">
        {images.map(({ asset, caption }, i) => (
          <li key={i} className={`${tiles[i].mobile} ${tiles[i].desktop} md:aspect-auto`}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block h-full w-full cursor-zoom-in overflow-hidden bg-paper-2 text-left"
              aria-label={`${label} ${i + 1} of ${images.length}: ${caption}. Open full screen`}
            >
              <RevealImage className="h-full w-full" delay={(i % 3) * 0.08}>
                <ResponsiveImage
                  asset={asset}
                  alt={caption}
                  sizes={tiles[i].sizes}
                  className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              </RevealImage>
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
              <span className="pointer-events-none absolute inset-x-4 bottom-3 hidden translate-y-2 items-end justify-between gap-4 text-sm text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:flex">
                <span className="max-w-[80%] leading-snug">{caption}</span>
                <span className="eyebrow shrink-0 text-white/70">
                  {String(i + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {index !== null && <LightboxModal slides={slides} index={index} onClose={() => setIndex(null)} />}
    </>
  );
}
