"use client";

import Lightbox, { type Slide } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

type Props = {
  slides: Slide[];
  index: number;
  onClose: () => void;
  kind?: "images" | "video";
};

// Loaded on demand (next/dynamic) the first time a gallery item is opened
export default function LightboxModal({ slides, index, onClose, kind = "images" }: Props) {
  const isVideo = kind === "video";
  return (
    <Lightbox
      open
      close={onClose}
      index={index}
      slides={slides}
      plugins={isVideo ? [Video, Captions] : [Zoom, Thumbnails, Captions, Counter, Fullscreen]}
      carousel={{ finite: isVideo, preload: 2 }}
      animation={{ fade: 300, swipe: 450 }}
      controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
      zoom={{ maxZoomPixelRatio: 2.5, scrollToZoom: true }}
      thumbnails={{ width: 96, height: 64, gap: 8, border: 0, padding: 0, vignette: true }}
      captions={{ descriptionTextAlign: "start", showToggle: false }}
      video={{ autoPlay: true, controls: true, playsInline: true }}
      counter={{ container: { style: { top: 0, bottom: "unset" } } }}
    />
  );
}
