"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import "pannellum/build/pannellum.css";
import type { TourHotspot } from "@/content/project";
import type { PanoramaAsset } from "@/lib/image-utils";
import {
  CollapseIcon,
  CompassIcon,
  DragIcon,
  ExpandIcon,
  HOTSPOT_ARROW_SVG,
  HOTSPOT_INFO_SVG,
  MinusIcon,
  PauseIcon,
  PlusIcon,
  RotateIcon,
} from "./Icons";

export type TourSceneData = {
  id: string;
  title: string;
  level: string;
  panorama: PanoramaAsset;
  yaw?: number;
  pitch?: number;
  hotspots: TourHotspot[];
};

type Props = {
  scenes: TourSceneData[];
  firstScene: string;
};

type Status = "idle" | "loading" | "ready" | "error";

const AUTO_ROTATE_SPEED = -1.6;

/**
 * Picks the panorama resolution for this device. Pannellum can display an
 * equirectangular image up to twice the GPU's max texture size; phones get
 * the 4096px version to keep memory use and download size low.
 */
function choosePanoramaWidth(available: number[]): number {
  let maxTexture = 4096;
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (gl) {
      maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {}
  const nav = navigator as Navigator & { deviceMemory?: number };
  const screenPx = Math.max(screen.width, screen.height) * (window.devicePixelRatio || 1);
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const wantHigh = !coarse && screenPx >= 1800 && (nav.deviceMemory ?? 8) >= 4;
  const usable = available.filter((w) => w <= maxTexture * 2 && (wantHigh || w <= 4096)).sort((a, b) => a - b);
  return usable.at(-1) ?? Math.min(...available);
}

function sourceFor(p: PanoramaAsset, width: number) {
  const sorted = [...p.sources].sort((a, b) => a.width - b.width);
  return (sorted.filter((s) => s.width <= width).at(-1) ?? sorted[0]).src;
}

export function VirtualTour({ scenes, firstScene }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const viewerEl = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PannellumViewer | null>(null);
  const rotatingRef = useRef(true);

  const [current, setCurrent] = useState(firstScene);
  const [status, setStatus] = useState<Status>("idle");
  const [rotating, setRotating] = useState(true);
  const [gyroSupported, setGyroSupported] = useState(false);
  const [gyroActive, setGyroActive] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const scene = scenes.find((s) => s.id === current) ?? scenes[0];
  const sceneIndex = scenes.indexOf(scene);

  // Create the viewer only when the section approaches the viewport
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let viewer: PannellumViewer | null = null;
    let cancelled = false;

    const init = async () => {
      setStatus("loading");
      await import("pannellum/build/pannellum.js");
      if (cancelled || !window.pannellum || !viewerEl.current) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      rotatingRef.current = !reduceMotion;
      setRotating(!reduceMotion);

      const width = choosePanoramaWidth(scenes[0].panorama.sources.map((s) => s.width));
      const titles = Object.fromEntries(scenes.map((s) => [s.id, s.title]));

      const toHotspot = (h: TourHotspot): PannellumHotSpot => {
        if (h.type === "scene") {
          return {
            type: "scene",
            sceneId: h.to,
            yaw: h.yaw,
            pitch: h.pitch,
            cssClass: "tour-hotspot tour-hotspot--scene",
            createTooltipFunc: (div) => {
              const label = h.label || titles[h.to];
              const dot = document.createElement("span");
              dot.className = "tour-hotspot__dot";
              dot.innerHTML = HOTSPOT_ARROW_SVG;
              const text = document.createElement("span");
              text.className = "tour-hotspot__label";
              text.textContent = label;
              div.append(dot, text);
              div.setAttribute("role", "button");
              div.setAttribute("aria-label", `Go to ${label}`);
              div.tabIndex = 0;
              div.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") viewerRef.current?.loadScene(h.to);
              });
            },
          };
        }
        return {
          type: "info",
          yaw: h.yaw,
          pitch: h.pitch,
          cssClass: "tour-hotspot tour-hotspot--info",
          createTooltipFunc: (div) => {
            const dot = document.createElement("span");
            dot.className = "tour-hotspot__dot";
            dot.innerHTML = HOTSPOT_INFO_SVG;
            const text = document.createElement("span");
            text.className = "tour-hotspot__label";
            text.textContent = h.label;
            div.append(dot, text);
            div.tabIndex = 0;
            div.setAttribute("aria-label", h.label);
            div.addEventListener("click", () => div.classList.toggle("is-open"));
          },
        };
      };

      viewer = window.pannellum.viewer(viewerEl.current, {
        default: {
          firstScene,
          sceneFadeDuration: 900,
          autoLoad: true,
          autoRotate: reduceMotion ? false : AUTO_ROTATE_SPEED,
          autoRotateInactivityDelay: 4000,
          showControls: false,
          mouseZoom: true,
          hfov: 105,
          minHfov: 50,
          maxHfov: 120,
          friction: 0.12,
        },
        scenes: Object.fromEntries(
          scenes.map((s) => [
            s.id,
            {
              title: s.title,
              type: "equirectangular",
              panorama: sourceFor(s.panorama, width),
              yaw: s.yaw ?? 0,
              pitch: s.pitch ?? 0,
              hotSpots: s.hotspots.map(toHotspot),
            },
          ])
        ),
      });
      viewerRef.current = viewer;

      viewer.on("load", () => {
        setStatus("ready");
        // Scene configs re-apply the default auto-rotate; respect the user's choice
        if (!rotatingRef.current) viewer?.stopAutoRotate();
      });
      viewer.on("scenechange", (id) => {
        setCurrent(String(id));
        setStatus("loading");
      });
      viewer.on("error", () => setStatus("error"));
      const interacted = () => {
        setShowHint(false);
        setTimeout(() => setGyroActive(Boolean(viewerRef.current?.isOrientationActive())), 50);
      };
      viewer.on("mousedown", interacted);
      viewer.on("touchstart", interacted);
      setGyroSupported(viewer.isOrientationSupported());
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        init();
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(wrap);

    return () => {
      cancelled = true;
      io.disconnect();
      viewer?.destroy();
      viewerRef.current = null;
    };
  }, [scenes, firstScene]);

  // Keep the WebGL canvas in sync with its box (layout changes, full screen)
  useEffect(() => {
    const el = viewerEl.current;
    if (!el) return;
    const ro = new ResizeObserver(() => viewerRef.current?.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Hide the "drag to explore" hint after a few seconds
  useEffect(() => {
    if (status !== "ready" || !showHint) return;
    const t = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(t);
  }, [status, showHint]);

  // Full screen: native API where available, CSS fallback on iPhone
  useEffect(() => {
    const onChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element };
      setFullscreen((doc.fullscreenElement ?? doc.webkitFullscreenElement) === wrapRef.current);
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  useEffect(() => {
    if (!pseudoFullscreen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPseudoFullscreen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [pseudoFullscreen]);

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    const doc = document as Document & { webkitExitFullscreen?: () => void; webkitFullscreenElement?: Element };
    if (!el) return;
    if (pseudoFullscreen) return setPseudoFullscreen(false);
    if (doc.fullscreenElement ?? doc.webkitFullscreenElement) {
      (doc.exitFullscreen?.bind(doc) ?? doc.webkitExitFullscreen?.bind(doc))?.();
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => setPseudoFullscreen(true));
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else {
      setPseudoFullscreen(true);
    }
  }, [pseudoFullscreen]);

  const toggleRotate = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (rotating) viewer.stopAutoRotate();
    else viewer.startAutoRotate(AUTO_ROTATE_SPEED);
    rotatingRef.current = !rotating;
    setRotating(!rotating);
  };

  const toggleGyro = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (viewer.isOrientationActive()) viewer.stopOrientation();
    else viewer.startOrientation();
    // iOS asks for permission first, so read the state back a moment later
    setTimeout(() => setGyroActive(viewer.isOrientationActive()), 600);
  };

  const zoom = (delta: number) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const [min, max] = viewer.getHfovBounds();
    viewer.setHfov(Math.min(max, Math.max(min, viewer.getHfov() + delta)), 400);
  };

  const goTo = (id: string) => {
    if (id === current) return;
    viewerRef.current?.loadScene(id);
  };

  const isFull = fullscreen || pseudoFullscreen;
  const btn =
    "pointer-events-auto grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-ink";

  return (
    <div
      ref={wrapRef}
      className={`tour-viewer relative h-[68svh] min-h-[420px] w-full overflow-hidden bg-night md:h-[min(82vh,860px)] ${
        pseudoFullscreen ? "tour-pseudo-fullscreen" : ""
      }`}
    >
      <div
        ref={viewerEl}
        className="absolute inset-0"
        tabIndex={0}
        aria-label={`360° view of the ${scene.title}. Drag or use the arrow keys to look around.`}
      />

      {/* Loading veil: the blurred preview of the scene being loaded */}
      <AnimatePresence>
        {status !== "ready" && (
          <motion.div
            key={scene.id}
            className="pointer-events-none absolute inset-0 grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="absolute inset-0 scale-110 bg-cover bg-center blur-xl"
              style={{ backgroundImage: `url(${scene.panorama.thumb})` }}
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative flex flex-col items-center gap-4 text-white">
              {status === "error" ? (
                <p className="text-sm">This panorama could not be loaded.</p>
              ) : (
                <>
                  <span className="size-9 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                  <p className="eyebrow text-white/85">Loading {scene.title}</p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene title */}
      <div className="pointer-events-none absolute left-4 top-4 text-white md:left-6 md:top-6">
        <p className="eyebrow text-white/70">
          {String(sceneIndex + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")} · {scene.level}
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={scene.id}
            className="mt-1 font-display text-3xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] md:text-5xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45 }}
          >
            {scene.title}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="pointer-events-none absolute right-4 top-4 flex flex-col gap-2 md:right-6 md:top-6">
        <button type="button" className={btn} onClick={toggleFullscreen} aria-label={isFull ? "Exit full screen" : "Full screen"}>
          {isFull ? <CollapseIcon /> : <ExpandIcon />}
        </button>
        <button
          type="button"
          className={btn}
          onClick={toggleRotate}
          aria-label={rotating ? "Stop auto-rotation" : "Start auto-rotation"}
          aria-pressed={rotating}
        >
          {rotating ? <PauseIcon /> : <RotateIcon />}
        </button>
        {gyroSupported && (
          <button
            type="button"
            className={`${btn} ${gyroActive ? "!bg-white !text-ink" : ""}`}
            onClick={toggleGyro}
            aria-label={gyroActive ? "Stop looking around with device motion" : "Look around by moving your device"}
            aria-pressed={gyroActive}
          >
            <CompassIcon />
          </button>
        )}
        <div className="hidden flex-col gap-2 md:flex">
          <button type="button" className={btn} onClick={() => zoom(-15)} aria-label="Zoom in">
            <PlusIcon />
          </button>
          <button type="button" className={btn} onClick={() => zoom(15)} aria-label="Zoom out">
            <MinusIcon />
          </button>
        </div>
      </div>

      {/* First-visit hint */}
      <AnimatePresence>
        {status === "ready" && showHint && (
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-full bg-black/50 px-5 py-3 text-sm text-white backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
          >
            <DragIcon />
            Drag to look around
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene switcher */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-16">
        <ul className="pointer-events-auto flex gap-2 overflow-x-auto px-4 pb-4 [scrollbar-width:none] md:gap-3 md:px-6 md:pb-6">
          {scenes.map((s, i) => {
            const active = s.id === current;
            return (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => goTo(s.id)}
                  aria-current={active ? "true" : undefined}
                  className={`group flex items-center gap-3 rounded-full py-1 pl-1 pr-4 text-left text-white backdrop-blur-md transition-colors ${
                    active ? "bg-white text-ink" : "bg-black/40 hover:bg-black/60"
                  }`}
                >
                  <span
                    className="block size-10 shrink-0 rounded-full bg-cover bg-center md:size-11"
                    style={{ backgroundImage: `url(${s.panorama.thumb})` }}
                  />
                  <span className="leading-tight">
                    <span className={`block text-[0.65rem] uppercase tracking-[0.14em] ${active ? "text-ink/60" : "text-white/60"}`}>
                      {String(i + 1).padStart(2, "0")} · {s.level}
                    </span>
                    <span className={`block text-sm ${active ? "text-ink" : "text-white"}`}>{s.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
