import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { loadPdfjs } from "../lib/pdf";
import { useI18n } from "../lib/i18n";
import { ZoomView } from "./ZoomView";
import type { Size } from "./ZoomView";

const PAD = 16; // space around the pages, at zoom 1
const GAP = 12; // space between pages, at zoom 1
const MAX_BITMAP_WIDTH = 4096; // canvases larger than this are slow or refused, so zoom past it stays soft

type Loaded = { pages: PDFPageProxy[]; ratios: number[] }; // ratios: height / width of each page

/** Renders a PDF with pdf.js, so it can be zoomed and moved. Pages are drawn only when they are near the viewer. */
export function PdfView({ file }: { file: File }) {
  const { t } = useI18n();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // The loading task owns the document, and destroying it frees both.
    let task: { destroy: () => Promise<void> } | null = null;
    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const loading = pdfjs.getDocument({ data: await file.arrayBuffer() });
        task = loading;
        const doc: PDFDocumentProxy = await loading.promise;
        const pages: PDFPageProxy[] = [];
        const ratios: number[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const size = page.getViewport({ scale: 1 });
          pages.push(page);
          ratios.push(size.height / size.width);
        }
        if (!cancelled) setLoaded({ pages, ratios });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [file]);

  if (failed) return <p className="learning-preview-empty">{t("cantOpen")}</p>;
  if (!loaded) return <p className="learning-preview-empty">{t("loading")}</p>;

  // The pages fill the viewer width; the stack is as tall as the pages, gaps and padding add up to.
  const fit = (vw: number): Size => {
    const pageWidth = Math.max(0, vw - 2 * PAD);
    const pagesHeight = loaded.ratios.reduce((sum, r) => sum + r * pageWidth, 0);
    const gaps = GAP * Math.max(0, loaded.ratios.length - 1);
    return { w: vw, h: pagesHeight + gaps + 2 * PAD };
  };

  return (
    <ZoomView fit={fit}>
      {(settled) => {
        // settled.width is the stack's width on screen; take the padding out to get the page width.
        const pageWidth = Math.max(0, settled.width - 2 * PAD * settled.zoom);
        return (
          <div className="learning-pdf-pages" style={{ padding: PAD, gap: GAP }}>
            {loaded.pages.map((page, i) => (
              <PdfPage key={i} page={page} ratio={loaded.ratios[i]} pixelWidth={pageWidth} />
            ))}
          </div>
        );
      }}
    </ZoomView>
  );
}

type PageProps = {
  page: PDFPageProxy;
  ratio: number;
  /** Width the page is shown at, in pixels, once zooming has settled. */
  pixelWidth: number;
};

function PdfPage({ page, ratio, pixelWidth }: PageProps) {
  const holder = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  // Draw only pages near the viewer. The viewer is the scrolling root, so pages outside it are skipped.
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const root = el.closest(".learning-zoom");
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      root,
      rootMargin: "400px 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = canvas.current;
    if (!visible || !el || pixelWidth <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    const bitmapWidth = Math.min(Math.round(pixelWidth * dpr), MAX_BITMAP_WIDTH);
    const natural = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: bitmapWidth / natural.width });
    el.width = Math.round(viewport.width);
    el.height = Math.round(viewport.height);
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const task = page.render({ canvasContext: ctx, viewport, canvas: el });
    // A render cancelled by a newer zoom rejects on purpose; nothing to report.
    task.promise.catch(() => {});
    return () => task.cancel();
  }, [visible, page, pixelWidth]);

  return (
    <div ref={holder} className="learning-pdf-page" style={{ aspectRatio: `1 / ${ratio}` }}>
      <canvas ref={canvas} />
    </div>
  );
}
