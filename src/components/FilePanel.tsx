import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import type { FileItem } from "../lib/folders";
import { THUMB_EXTENSIONS, extOf } from "../lib/thumbnails";
import { isAudio } from "../lib/audio";
import { useI18n } from "../lib/i18n";
import { FileThumb } from "./FileThumb";
import { AudioPlayButton } from "./AudioPlayButton";

type Props = {
  name: string;
  /** null while the file list is still being read */
  files: FileItem[] | null;
  onOpen: (file: FileItem) => void;
};

type View = "list" | "thumbs";

/** Files inside the selected subfolder, listed under the search field.
 *  The thumbnail view is offered only when the folder contains images, PDFs or audio. */
export function FilePanel({ name, files, onOpen }: Props) {
  const [view, setView] = useState<View>("list");
  const { t, files: fileCount } = useI18n();
  const hasPreviews = !!files && files.some((f) => THUMB_EXTENSIONS.has(extOf(f.name)) || isAudio(f.name));
  const showThumbs = hasPreviews && view === "thumbs";

  return (
    <section className="learning-files" aria-label={t("filesIn", { name })}>
      <header className="learning-files-head">
        <span className="learning-files-name">{name}</span>
        <span className="learning-files-tools">
          <span className="learning-files-count">
            {files ? fileCount(files.length) : t("reading")}
          </span>
          {hasPreviews && (
            <div className="learning-view-toggle" role="group" aria-label={t("view")}>
              <button
                type="button"
                aria-pressed={view === "list"}
                aria-label={t("listView")}
                title={t("listTitle")}
                onClick={() => setView("list")}
              >
                <List size={15} strokeWidth={1.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-pressed={view === "thumbs"}
                aria-label={t("thumbView")}
                title={t("thumbTitle")}
                onClick={() => setView("thumbs")}
              >
                <LayoutGrid size={15} strokeWidth={1.6} aria-hidden="true" />
              </button>
            </div>
          )}
        </span>
      </header>

      {files && !showThumbs && (
        <ul className="learning-files-list scrollbar-hide">
          {files.length ? (
            files.map((file) => (
              <li key={file.name}>
                <button type="button" className="learning-files-item" title={file.name} onClick={() => onOpen(file)}>
                  {file.name}
                </button>
              </li>
            ))
          ) : (
            <li className="learning-files-empty">{t("noFilesInFolder")}</li>
          )}
        </ul>
      )}

      {files && showThumbs && (
        <ul className="learning-thumb-grid scrollbar-hide">
          {files.map((file) => (
            <li key={file.name}>
              <button type="button" className="learning-thumb" title={file.name} onClick={() => onOpen(file)}>
                <FileThumb item={file} />
                <span className="learning-thumb-name">{file.name}</span>
              </button>
              {isAudio(file.name) && <AudioPlayButton item={file} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
