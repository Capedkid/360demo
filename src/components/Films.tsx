"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { pickSource, type ImageAsset } from "@/lib/image-utils";
import { PlayIcon } from "./Icons";
import { Reveal } from "./Reveal";
import { ResponsiveImage } from "./ResponsiveImage";

const LightboxModal = dynamic(() => import("./LightboxModal"), { ssr: false });

export type FilmData = {
  title: string;
  description: string;
  video: string;
  preview?: string;
  poster: ImageAsset;
  duration?: string;
};

/** Muted preview loop that only plays while the card is on screen */
function PreviewLoop({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.src) video.src = src;
          video.play().then(() => setVisible(true)).catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
    />
  );
}

/** First film full width; the rest fill rows of three or two so no gaps are left */
function cardSpans(count: number): string[] {
  const spans = ["md:col-span-6"];
  let rem = count - 1;
  while (rem > 0) {
    if (rem === 1) {
      spans.push("md:col-span-6");
      rem -= 1;
    } else if (rem === 2 || rem === 4) {
      spans.push("md:col-span-3", "md:col-span-3");
      rem -= 2;
    } else {
      spans.push("md:col-span-2", "md:col-span-2", "md:col-span-2");
      rem -= 3;
    }
  }
  return spans;
}

export function Films({ films }: { films: FilmData[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const spans = cardSpans(films.length);

  const slides = films.map((f) => ({
    type: "video" as const,
    title: f.title,
    description: f.description,
    poster: pickSource(f.poster, 1920).src,
    width: 1920,
    height: 1080,
    sources: [{ src: f.video, type: "video/mp4" }],
  }));

  return (
    <>
      <ul className="grid gap-3 md:grid-cols-6 md:gap-4">
        {films.map((film, i) => (
          <Reveal as="li" key={film.video} delay={(i % 3) * 0.1} className={spans[i]}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block w-full overflow-hidden bg-night-2 text-left text-white"
              aria-label={`Play film: ${film.title}`}
            >
              <div className={`relative ${i === 0 ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[16/9]"}`}>
                <ResponsiveImage
                  asset={film.poster}
                  alt=""
                  sizes={i === 0 ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {film.preview && <PreviewLoop src={film.preview} />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20 transition-opacity duration-500 group-hover:opacity-80" />

                <span
                  className={`absolute grid place-items-center rounded-full border border-white/60 bg-white/10 backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-ink ${
                    i === 0
                      ? "left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 md:size-20"
                      : "right-4 top-4 size-12 md:right-5 md:top-5 md:size-14"
                  }`}
                >
                  <PlayIcon width={i === 0 ? 22 : 18} height={i === 0 ? 22 : 18} className="translate-x-0.5" />
                </span>

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 md:p-6">
                  <div>
                    <p className="eyebrow text-white/65">Film {String(i + 1).padStart(2, "0")}</p>
                    <p className={`mt-1 font-display leading-none ${i === 0 ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"}`}>
                      {film.title}
                    </p>
                    <p className="mt-2 text-sm text-white/75">{film.description}</p>
                  </div>
                  {film.duration && <span className="eyebrow shrink-0 text-white/75">{film.duration}</span>}
                </div>
              </div>
            </button>
          </Reveal>
        ))}
      </ul>

      {index !== null && <LightboxModal kind="video" slides={slides} index={index} onClose={() => setIndex(null)} />}
    </>
  );
}
