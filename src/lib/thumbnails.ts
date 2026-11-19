/**
 * Thumbnails for image files. Each one is a JPEG, 320 px on its longest side, quality 0.72.
 * PSD uses the thumbnail embedded in the file, TIFF is decoded with utif, PDF renders
 * page 1 with pdf.js. Everything else goes through the browser's own image decoder.
 * Results are cached per file, and decoding is lazy: it starts when a thumbnail scrolls into view.
 */
import type { FileItem } from "./folders";
import { extractPsdThumbnail } from "./psd";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export const THUMB_EXTENSIONS = new Set(["psd", "png", "tif", "tiff", "jpg", "jpeg", "gif", "pdf"]);

const MAX_EDGE = 320;
const JPEG_QUALITY = 0.72;
const PSD_HEAD_BYTES = 8 * 1024 * 1024; // the thumbnail sits near the start of the file

export function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i + 1).toLowerCase() : "";
}

type Decoded = { source: CanvasImageSource; width: number; height: number };

async function renderPdf(file: File): Promise<Decoded> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
  try {
    const doc = await task.promise;
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: MAX_EDGE / Math.max(base.width, base.height) });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    return { source: canvas, width: canvas.width, height: canvas.height };
  } finally {
    await task.destroy();
  }
}

async function decodeTiff(file: File): Promise<Decoded> {
  const UTIF = (await import("utif")).default;
  const buf = await file.arrayBuffer();
  const [ifd] = UTIF.decode(buf);
  if (!ifd) throw new Error("empty TIFF");
  UTIF.decodeImage(buf, ifd);
  const rgba = UTIF.toRGBA8(ifd);
  const canvas = document.createElement("canvas");
  canvas.width = ifd.width;
  canvas.height = ifd.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  const pixels = new Uint8ClampedArray(rgba); // copy, so the buffer type is a plain ArrayBuffer
  ctx.putImageData(new ImageData(pixels, ifd.width, ifd.height), 0, 0);
  return { source: canvas, width: ifd.width, height: ifd.height };
}

async function decode(file: File, ext: string): Promise<Decoded> {
  if (ext === "pdf") return renderPdf(file);
  if (ext === "tif" || ext === "tiff") return decodeTiff(file);
  if (ext === "psd") {
    const jpeg = extractPsdThumbnail(await file.slice(0, PSD_HEAD_BYTES).arrayBuffer());
    if (!jpeg) throw new Error("PSD without embedded thumbnail");
    const bitmap = await createImageBitmap(jpeg);
    return { source: bitmap, width: bitmap.width, height: bitmap.height };
  }
  const bitmap = await createImageBitmap(file);
  return { source: bitmap, width: bitmap.width, height: bitmap.height };
}

async function render(item: FileItem): Promise<string | null> {
  const file = await item.open();
  const { source, width, height } = await decode(file, extOf(item.name));

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(width * scale));
  out.height = Math.max(1, Math.round(height * scale));
  const ctx = out.getContext("2d");
  if (!ctx) return null;
  // JPEG has no alpha, so transparent pixels get a dark background that matches the UI.
  ctx.fillStyle = "#0b1015";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, out.width, out.height);

  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
  return blob ? URL.createObjectURL(blob) : null;
}

const cache = new WeakMap<FileItem, Promise<string | null>>();

/** Object URL of the item's thumbnail, or null if it cannot be made. */
export function thumbnailFor(item: FileItem): Promise<string | null> {
  let result = cache.get(item);
  if (!result) {
    result = render(item).catch(() => null);
    cache.set(item, result);
  }
  return result;
}
