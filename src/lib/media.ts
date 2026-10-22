import manifest from "@/generated/media.json";
import type { ImageAsset, PanoramaAsset, VideoAsset } from "./image-utils";

export * from "./image-utils";

type Manifest = {
  images: Record<string, ImageAsset>;
  panoramas: Record<string, PanoramaAsset>;
  videos: Record<string, VideoAsset>;
};

const media = manifest as Manifest;

function lookup<T>(kind: keyof Manifest, key: string): T {
  const entry = media[kind][key] as T | undefined;
  if (!entry) {
    throw new Error(
      `Missing ${kind.slice(0, -1)} "media/${key}". Check the file name in src/content/project.ts and run "npm run media".`
    );
  }
  return entry;
}

export const getImage = (key: string) => lookup<ImageAsset>("images", key);
export const getPanorama = (key: string) => lookup<PanoramaAsset>("panoramas", key);
export const getVideo = (key: string) => lookup<VideoAsset>("videos", key);
