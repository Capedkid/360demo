# Architectural Presentation Website

A fast, static presentation site for a single architectural project: hero, project overview, exterior and interior galleries with full-screen viewing, a 360° virtual tour, animation previews, an interactive floor plan, a material palette and a contact section.

Built with Next.js (static export), Tailwind CSS, [Pannellum](https://pannellum.org) for 360° panoramas and [yet-another-react-lightbox](https://yet-another-react-lightbox.com) for galleries and films. No database, no server and no paid services.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

`npm run dev` and `npm run build` first run `npm run media`, which optimises everything in `/media` (see below).

## Project structure

```
media/                    ← YOUR SOURCE FILES (images, panoramas, videos)
  exterior/  interior/  details/  materials/
  panoramas/              ← 360° images (2:1 equirectangular)
  videos/                 ← MP4 films, short preview loops, poster images
src/content/project.ts    ← ALL TEXT and the list of media shown on the site
scripts/optimize-media.mjs← turns /media into web-ready files in public/media
src/components/           ← page sections (Hero, Gallery, VirtualTour, Films, FloorPlan…)
```

Generated folders (`public/media`, `src/generated`, `out`) are rebuilt automatically; don't edit them.

## Updating content

Everything visible on the site is controlled from **`src/content/project.ts`**. After a change, run `npm run dev` to preview or `npm run build` to publish.

### Text
Edit the strings in `project.ts`: project name, tagline, overview paragraphs, key facts, section headings, captions, contact details and credits.

### Images (renderings, photos)
1. Copy the file into the matching folder, e.g. `media/exterior/front-dusk.jpg`.
2. Add a line to the gallery in `project.ts`:
   ```ts
   { image: "exterior/front-dusk.jpg", caption: "Street elevation at dusk" },
   ```
3. Reorder lines to reorder the gallery. Remove a line to hide an image.

Tips: JPG or PNG, long edge **2400–4000 px**. The build creates WebP versions at 640, 1080, 1600 and 2400 px plus a blurred placeholder, so visitors only download the size their screen needs. The gallery layout adapts to any number of images.

### 360° panoramas
1. Export an **equirectangular** panorama (2:1 ratio, ideally **8192 × 4096**, JPG) from your renderer (V-Ray, Corona, Enscape, Lumion, D5, Twinmotion all support this).
2. Copy it into `media/panoramas/`.
3. Add a scene in `project.ts → tour.scenes`:
   ```ts
   {
     id: "kitchen",
     title: "Kitchen",
     level: "Ground floor",
     panorama: "panoramas/kitchen.jpg",
     hotspots: [
       { type: "scene", to: "living-hall", label: "Living Hall", yaw: 140, pitch: -8 },
       { type: "info", label: "Calacatta marble worktop", yaw: -20, pitch: -15 },
     ],
   },
   ```
   - `type: "scene"` hotspots are arrows that move to another room (`to` = that scene's `id`).
   - `type: "info"` hotspots show a short note.
   - `yaw` = horizontal angle (−180…180, 0 = centre of the image), `pitch` = vertical angle (−90…90, 0 = horizon). From a pixel position in the panorama image: `yaw = (x / width − 0.5) × 360`, `pitch = (0.5 − y / height) × 180`.
4. `tour.firstScene` sets which room the tour opens in.

The build produces a 4096 px version for phones and an 8192 px version for large screens; the viewer picks the right one per device.

### Films / animation previews
1. Put the film in `media/videos/` as **MP4 (H.264), 1080p, under ~20 MB**.
2. Optional: a 5–8 second muted loop (`…-preview.mp4`, ~640 px wide) that plays on the card, and a poster JPG (`…-poster.jpg`).
3. Add an entry to `project.ts → films.items`.

### Floor plan
The plan is a drawing in `src/components/FloorPlan.tsx` (room names, areas and outlines in the `ROOMS` list). Replacing it with your own plan (SVG/PDF export) is a small change.

## Build and deploy

```bash
npm run build      # creates the static site in /out
npm start          # preview /out locally
```

**Cloudflare Pages (recommended, free):** connect the Git repository, set *Build command* `npm run build`, *Output directory* `out`, and an environment variable `SITE_URL=https://your-domain.com` (used for link previews). Alternatively, upload the folder directly: `npx wrangler pages deploy out`.

Any static host works the same way (Netlify, GitHub Pages, S3, a regular web server): upload the contents of `/out`.

**Running costs:** hosting $0 on the free tiers above. Only a custom domain (~$10–15/year) is a recurring cost.

## Demo content credits
The demo uses free stock media in place of client renderings:
- Photography: Max Vakhtbovych via [Pexels](https://www.pexels.com) (Pexels License)
- Films: Kindel Media and Hamza Awan via Pexels (Pexels License)
- 360° panoramas: [Poly Haven](https://polyhaven.com) (CC0)

Project name, figures and plan are illustrative.
