import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { FileText, X } from "lucide-react";
import type { FileItem } from "../lib/folders";
import { useI18n } from "../lib/i18n";
import { ZoomView } from "./ZoomView";
import type { Size } from "./ZoomView";
import { PdfView } from "./PdfView";

type Props = {
  item: FileItem;
  /** null while the file is being read */
  file: File | null;
  error: boolean;
  onClose: () => void;
};

type Kind = "text" | "image" | "pdf" | "video" | "audio" | "none";

const TEXT_LIMIT = 200_000; // bytes read for text previews
const TEXT_EXT = new Set([
  "txt", "md", "markdown", "json", "js", "jsx", "mjs", "ts", "tsx", "css", "scss", "less",
  "html", "htm", "xml", "svg", "yml", "yaml", "toml", "ini", "cfg", "conf", "env", "csv",
  "tsv", "log", "sh", "bash", "zsh", "py", "rb", "go", "rs", "java", "kt", "swift", "c",
  "h", "cpp", "hpp", "cs", "php", "sql", "gitignore", "lock",
]);
const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp", "ico"]);
const VIDEO_EXT = new Set(["mp4", "webm", "mov", "m4v", "ogv"]);
const AUDIO_EXT = new Set(["mp3", "wav", "ogg", "oga", "m4a", "flac", "aac", "opus"]);

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i + 1).toLowerCase() : "";
}

function kindOf(file: File): Kind {
  const ext = extOf(file.name);
  const type = file.type;
  if (type.startsWith("image/") || IMAGE_EXT.has(ext)) return "image";
  if (type === "application/pdf" || ext === "pdf") return "pdf";
  if (type.startsWith("video/") || VIDEO_EXT.has(ext)) return "video";
  if (type.startsWith("audio/") || AUDIO_EXT.has(ext)) return "audio";
  if (type.startsWith("text/") || type.includes("json") || type.includes("javascript") || type.includes("xml") || TEXT_EXT.has(ext)) return "text";
  return "none";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}

const MIN_WIDTH = 360;
const MIN_HEIGHT = 240;
const SCREEN_MARGIN = 48; // the backdrop's padding on both sides

/** The size the user last dragged the popup to. Kept for the session, so the next file opens the same size. */
let savedSize: Size | null = null;

/** An image in the zoom viewer. It starts fitted to the viewer and keeps its proportions. */
function ZoomImage({ url, alt }: { url: string; alt: string }) {
  const [natural, setNatural] = useState<Size | null>(null);
  const fit = (vw: number, vh: number): Size => {
    const nw = natural?.w || 4; // some SVGs report no size; a 4:3 box is a reasonable stand-in
    const nh = natural?.h || 3;
    const scale = Math.min(vw / nw, vh / nh);
    return { w: nw * scale, h: nh * scale };
  };
  return (
    <ZoomView fit={fit}>
      {() => (
        <img
          className="learning-zoom-img"
          src={url}
          alt={alt}
          draggable={false}
          onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        />
      )}
    </ZoomView>
  );
}

/** Popup that shows a file from the selected subfolder. Keyed by file name by the parent,
 *  so each file starts with fresh state. */
export function FilePreview({ item, file, error, onClose }: Props) {
  const { lang, t } = useI18n();
  const kind = file ? kindOf(file) : null;
  const [url, setUrl] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [size, setSizeState] = useState<Size | null>(savedSize);
  const modalRef = useRef<HTMLDivElement>(null);
  const resizing = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const setSize = (next: Size) => {
    savedSize = next;
    setSizeState(next);
  };

  const startResize = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = modalRef.current?.getBoundingClientRect();
    if (!rect) return;
    resizing.current = { x: e.clientX, y: e.clientY, w: rect.width, h: rect.height };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const moveResize = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = resizing.current;
    if (!start) return;
    // The popup is centered, so each edge moves half of the change. Doubling the pointer movement keeps the grip under the pointer.
    setSize({
      w: Math.min(Math.max(start.w + 2 * (e.clientX - start.x), MIN_WIDTH), window.innerWidth - SCREEN_MARGIN),
      h: Math.min(Math.max(start.h + 2 * (e.clientY - start.y), MIN_HEIGHT), window.innerHeight - SCREEN_MARGIN),
    });
  };

  const endResize = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizing.current) return;
    resizing.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  useEffect(() => {
    if (!file || !kind || kind === "none") return;
    if (kind === "text") {
      let cancelled = false;
      file
        .slice(0, TEXT_LIMIT)
        .text()
        .then((t) => {
          if (!cancelled) setText(t);
        })
        .catch(() => {
          if (!cancelled) setText("");
        });
      return () => {
        cancelled = true;
      };
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, kind]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const body = (() => {
    if (error) return <p className="learning-preview-empty">{t("cantOpen")}</p>;
    if (!file || !kind) return <p className="learning-preview-empty">{t("loading")}</p>;
    if (kind === "none") return <p className="learning-preview-empty">{t("noPreview")}</p>;
    if (kind === "text") {
      if (text === null) return <p className="learning-preview-empty">{t("loading")}</p>;
      return (
        <>
          <pre className="learning-preview-text">{text}</pre>
          {file.size > TEXT_LIMIT && (
            <p className="learning-preview-truncated">{t("truncated", { size: formatBytes(TEXT_LIMIT) })}</p>
          )}
        </>
      );
    }
    if (kind === "pdf") return <PdfView file={file} />;
    if (!url) return <p className="learning-preview-empty">{t("loading")}</p>;
    if (kind === "image") return <ZoomImage url={url} alt={item.name} />;
    if (kind === "video") return <video className="learning-preview-media" src={url} controls />;
    return <audio className="learning-preview-audio" src={url} controls />;
  })();
  const zoomable = kind === "image" || (kind === "pdf" && !error);

  const meta = file
    ? [
        formatBytes(file.size),
        file.type || (extOf(file.name) ? extOf(file.name).toUpperCase() : t("unknownType")),
        new Date(file.lastModified).toLocaleDateString(lang, { year: "numeric", month: "short", day: "numeric" }),
      ]
    : [];

  return createPortal(
    <motion.div
      className="learning-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        className="learning-modal"
        style={
          size
            ? {
                width: `min(${size.w}px, calc(100vw - ${SCREEN_MARGIN}px))`,
                height: `min(${size.h}px, calc(100vh - ${SCREEN_MARGIN}px))`,
                maxWidth: "none",
                maxHeight: "none",
              }
            : undefined
        }
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="learning-modal-head">
          <span className="learning-modal-icon">
            <FileText size={18} strokeWidth={1.6} aria-hidden="true" />
          </span>
          <div className="learning-modal-title">
            <h2>{item.name}</h2>
            {meta.length > 0 && (
              <div className="learning-modal-meta">
                {meta.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="learning-modal-close" onClick={onClose} aria-label={t("close")}>
            <X size={18} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </header>
        <div className={zoomable ? "learning-modal-body is-zoom" : "learning-modal-body"}>{body}</div>
        <div
          className="learning-modal-grip"
          title={t("resizeWindow")}
          aria-hidden="true"
          onPointerDown={startResize}
          onPointerMove={moveResize}
          onPointerUp={endResize}
          onPointerCancel={endResize}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M11 4 4 11M11 8 8 11" />
          </svg>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
