// Pure helpers and types, safe to import from client components
// (unlike ./media.ts, which pulls in the whole media manifest).

export type ImageSource = { src: string; width: number; height: number };

export type ImageAsset = {
  width: number;
  height: number;
  blur: string;
  sources: ImageSource[];
};

export type PanoramaAsset = {
  width: number;
  height: number;
  preview: string;
  thumb: string;
  sources: { src: string; width: number }[];
};

export type VideoAsset = { src: string; bytes: number };

/** Largest generated width that is at most `max` */
export function pickSource(asset: ImageAsset, max = 1600): ImageSource {
  const fitting = asset.sources.filter((s) => s.width <= max);
  return fitting.at(-1) ?? asset.sources[0];
}

export const srcSet = (asset: ImageAsset) => asset.sources.map((s) => `${s.src} ${s.width}w`).join(", ");
