import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { FileText, X } from "lucide-react";
import type { FileItem } from "../lib/folders";
import { useI18n } from "../lib/i18n";

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

/** Popup that shows a file from the selected subfolder. Keyed by file name by the parent,
 *  so each file starts with fresh state. */
export function FilePreview({ item, file, error, onClose }: Props) {
  const { lang, t } = useI18n();
  const kind = file ? kindOf(file) : null;
  const [url, setUrl] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);

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
    if (!url) return <p className="learning-preview-empty">{t("loading")}</p>;
    if (kind === "image") return <img className="learning-preview-media" src={url} alt={item.name} />;
    if (kind === "pdf") return <iframe className="learning-preview-frame" src={url} title={item.name} />;
    if (kind === "video") return <video className="learning-preview-media" src={url} controls />;
    return <audio className="learning-preview-audio" src={url} controls />;
  })();

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
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        className="learning-modal"
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
        <div className="learning-modal-body">{body}</div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
