// Turns the source files in /media into web-ready assets in /public/media
// and writes a manifest (src/generated/media.json) the site reads at build time.
//
//   media/<any folder>/*.jpg|png|webp  -> responsive WebP set + blur placeholder
//   media/panoramas/*.jpg              -> 4096px + 8192px equirectangular JPEGs, preview, thumbnail
//   media/**/*.mp4|webm                -> copied as-is
//
// Unchanged files are skipped, so re-running is fast.

import sharp from "sharp";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "media");
const OUT_DIR = path.join(ROOT, "public", "media");
const MANIFEST_FILE = path.join(ROOT, "src", "generated", "media.json");
const CACHE_FILE = path.join(OUT_DIR, ".cache.json");

const IMAGE_WIDTHS = [640, 1080, 1600, 2400];
const PANORAMA_WIDTHS = [4096, 8192];
const IMAGE_RE = /\.(jpe?g|png|webp|tiff?)$/i;
const VIDEO_RE = /\.(mp4|webm|mov)$/i;

const toPosix = (p) => p.split(path.sep).join("/");
const stripExt = (p) => p.replace(/\.[^.]+$/, "");
const publicUrl = (outRel) => "/media/" + toPosix(outRel);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = await Promise.all(
    entries.map((e) => {
      const full = path.join(dir, e.name);
      if (e.name.startsWith(".")) return [];
      return e.isDirectory() ? walk(full) : [full];
    })
  );
  return files.flat();
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function stamp(file) {
  const s = await stat(file);
  return createHash("sha1").update(`${s.size}:${s.mtimeMs}:v3`).digest("hex").slice(0, 12);
}

async function blurDataUrl(input) {
  const buf = await sharp(input).rotate().resize(24).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

async function processImage(file, key) {
  const meta = await sharp(file).rotate().metadata();
  // metadata() reports pre-rotation size; swap for 90°/270° EXIF orientations
  const rotated = meta.orientation && meta.orientation >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;
  const targets = [...new Set(IMAGE_WIDTHS.map((w) => Math.min(w, width)))];

  const sources = [];
  for (const w of targets) {
    const outRel = `${stripExt(key)}-${w}.webp`;
    const outFile = path.join(OUT_DIR, outRel);
    await mkdir(path.dirname(outFile), { recursive: true });
    await sharp(file).rotate().resize({ width: w }).webp({ quality: 78, effort: 5 }).toFile(outFile);
    sources.push({ src: publicUrl(outRel), width: w, height: Math.round((height * w) / width) });
  }

  return { width, height, blur: await blurDataUrl(file), sources };
}

async function processPanorama(file, key) {
  const meta = await sharp(file).metadata();
  const { width, height } = meta;
  if (Math.abs(width / height - 2) > 0.01) {
    console.warn(`  ! ${key} is ${width}x${height}; equirectangular panoramas should be 2:1`);
  }
  const base = stripExt(key);
  const targets = [...new Set(PANORAMA_WIDTHS.map((w) => Math.min(w, width)))];

  const sources = [];
  for (const w of targets) {
    const outRel = `${base}-${w}.jpg`;
    const outFile = path.join(OUT_DIR, outRel);
    await mkdir(path.dirname(outFile), { recursive: true });
    await sharp(file, { limitInputPixels: false })
      .resize({ width: w, height: w / 2, fit: "fill" })
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toFile(outFile);
    sources.push({ src: publicUrl(outRel), width: w });
  }

  const previewRel = `${base}-preview.jpg`;
  await sharp(file, { limitInputPixels: false })
    .resize({ width: 1024, height: 512, fit: "fill" })
    .jpeg({ quality: 60, mozjpeg: true })
    .toFile(path.join(OUT_DIR, previewRel));

  // Thumbnail: the low-distortion band around yaw 0 / pitch 0 (the panorama's centre)
  const thumbRel = `${base}-thumb.webp`;
  await sharp(file, { limitInputPixels: false })
    .extract({
      left: Math.round(width * 0.375),
      top: Math.round(height * 0.36),
      width: Math.round(width * 0.25),
      height: Math.round(height * 0.28),
    })
    .resize({ width: 640, height: 360, fit: "cover" })
    .webp({ quality: 75 })
    .toFile(path.join(OUT_DIR, thumbRel));

  return { width, height, preview: publicUrl(previewRel), thumb: publicUrl(thumbRel), sources };
}

async function processVideo(file, key) {
  const outFile = path.join(OUT_DIR, key);
  await mkdir(path.dirname(outFile), { recursive: true });
  await copyFile(file, outFile);
  const { size } = await stat(file);
  return { src: publicUrl(key), bytes: size };
}

function outputsOf(entry) {
  const urls = [];
  if (entry.sources) urls.push(...entry.sources.map((s) => s.src));
  if (entry.preview) urls.push(entry.preview);
  if (entry.thumb) urls.push(entry.thumb);
  if (entry.src) urls.push(entry.src);
  return urls.map((u) => path.join(OUT_DIR, u.replace(/^\/media\//, "")));
}

async function main() {
  const started = Date.now();
  const files = await walk(SRC_DIR);
  const cache = await readJson(CACHE_FILE, {});
  const manifest = { images: {}, panoramas: {}, videos: {} };
  const nextCache = {};
  let processed = 0;

  for (const file of files) {
    const key = toPosix(path.relative(SRC_DIR, file));
    const isPanorama = key.startsWith("panoramas/") && IMAGE_RE.test(key);
    const kind = isPanorama ? "panoramas" : IMAGE_RE.test(key) ? "images" : VIDEO_RE.test(key) ? "videos" : null;
    if (!kind) continue;

    const s = await stamp(file);
    const cached = cache[key];
    let entry;
    if (cached && cached.stamp === s && cached.kind === kind) {
      entry = cached.entry;
    } else {
      console.log(`  - ${key}`);
      entry =
        kind === "panoramas"
          ? await processPanorama(file, key)
          : kind === "images"
            ? await processImage(file, key)
            : await processVideo(file, key);
      processed++;
    }
    manifest[kind][key] = entry;
    nextCache[key] = { stamp: s, kind, entry };
  }

  // Remove outputs whose source file no longer exists
  const keep = new Set(Object.values(nextCache).flatMap((c) => outputsOf(c.entry)));
  keep.add(CACHE_FILE);
  for (const out of await walk(OUT_DIR)) {
    if (!keep.has(out)) await rm(out);
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(nextCache));
  await mkdir(path.dirname(MANIFEST_FILE), { recursive: true });
  await writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + "\n");

  const count = (k) => Object.keys(manifest[k]).length;
  console.log(
    `media: ${count("images")} images, ${count("panoramas")} panoramas, ${count("videos")} videos ` +
      `(${processed} processed) in ${((Date.now() - started) / 1000).toFixed(1)}s`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
