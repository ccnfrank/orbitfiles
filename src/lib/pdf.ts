import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

type PdfJs = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfJs> | null = null;

/** pdf.js, loaded on first use. The worker is set up once, here, for thumbnails and the preview. */
export function loadPdfjs(): Promise<PdfJs> {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    return pdfjs;
  });
  return pdfjsPromise;
}
