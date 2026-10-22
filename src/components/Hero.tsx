"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ResponsiveImage } from "./ResponsiveImage";
import type { ImageAsset } from "@/lib/image-utils";

type Props = {
  title: string;
  kicker: string;
  tagline: string;
  image: ImageAsset;
  alt: string;
  facts: { label: string; value: string }[];
};

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({ title, kicker, tagline, image, alt, facts }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.06, reduce ? 1.06 : 1.16]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const words = title.split(" ");

  return (
    <section ref={ref} id="top" className="relative h-[100svh] min-h-[560px] overflow-hidden bg-night text-white">
      <motion.div className="absolute inset-0" style={{ y: imageY, scale: imageScale }}>
        <ResponsiveImage
          asset={image}
          alt={alt}
          // On portrait screens the 3:2 image is cropped to fill the height, so it renders ~1.6× the viewport height wide
          sizes="(max-aspect-ratio: 3/2) 160vh, 100vw"
          priority
          className="h-full w-full object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/70" />

      <motion.div
        className="container-x relative flex h-full flex-col justify-end pb-10 md:pb-14"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <motion.p
          className="eyebrow mb-5 text-white/80"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.2 }}
        >
          {kicker}
        </motion.p>

        <h1 className="font-display text-[clamp(3.25rem,10vw,9.5rem)] leading-[0.92] tracking-[-0.02em]">
          {words.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span
                className="inline-block"
                initial={reduce ? false : { y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.3, ease: EASE, delay: 0.3 + i * 0.12 }}
              >
                {i === words.length - 1 ? <em className="italic">{word}</em> : word}
              </motion.span>
              {i < words.length - 1 && " "}
            </span>
          ))}
        </h1>

        <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-[1fr_auto] md:items-end">
          <motion.p
            className="max-w-md text-base leading-relaxed text-white/85 md:text-lg"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.75 }}
          >
            {tagline}
          </motion.p>

          <motion.dl
            className="hidden grid-cols-3 gap-10 border-t border-white/25 pt-4 md:grid"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1 }}
          >
            {facts.slice(1, 4).map((f) => (
              <div key={f.label}>
                <dt className="eyebrow text-white/60">{f.label}</dt>
                <dd className="mt-1 text-sm">{f.value}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

      </motion.div>

      <a
        href="#overview"
        aria-label="Scroll to overview"
        className="absolute bottom-0 left-1/2 hidden h-12 w-px -translate-x-1/2 overflow-hidden bg-white/25 md:block"
      >
        <span className="block h-full w-full origin-top animate-[scroll-cue_2.2s_cubic-bezier(0.16,1,0.3,1)_infinite] bg-white" />
      </a>
    </section>
  );
}
