import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { FileText, Folder, LayoutGrid, List, Search } from "lucide-react";
import type { SearchEntry } from "../lib/folders";
import { THUMB_EXTENSIONS, extOf } from "../lib/thumbnails";
import { FileThumb } from "./FileThumb";
import { AudioPlayButton } from "./AudioPlayButton";
import { isAudio } from "../lib/audio";
import { useI18n } from "../lib/i18n";

type Props = {
  /** Rows to show for the current query (or the default list when the query is empty). */
  items: SearchEntry[];
  placeholder: string;
  /** Message shown when there are no rows, chosen by the parent for the current mode. */
  emptyText: string;
  onPick: (entry: SearchEntry) => void;
  onInputChange: (value: string) => void;
  /** Controls rendered at the end of the input field, after the search icon. */
  action?: ReactNode;
};

export function FolderSearch({ items, placeholder, emptyText, onPick, onInputChange, action }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimer = useRef<number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { t } = useI18n();
  const [view, setView] = useState<"list" | "thumbs">("list");
  // The grid is offered only when some result is an image or PDF file, as in the file panel. Audio alone doesn't count.
  const hasThumbs = items.some((e) => e.item && THUMB_EXTENSIONS.has(extOf(e.item.name)));
  const grid = hasThumbs && view === "thumbs";

  const handleChange = (next: string) => {
    setValue(next);
    setOpen(true);
    onInputChange(next);
  };

  const handlePick = (entry: SearchEntry) => {
    setOpen(false);
    onPick(entry);
  };

  return (
    <Command shouldFilter={false} className="learning-search-command">
      <div className="learning-search-input-wrap">
        <Search className="learning-search-icon" size={19} strokeWidth={1.6} aria-hidden="true" />
        <Command.Input
          ref={inputRef}
          value={value}
          onValueChange={handleChange}
          onFocus={() => {
            window.clearTimeout(blurTimer.current);
            setOpen(true);
          }}
          onClick={() => setOpen(true)}
          onBlur={() => {
            // Delay so a click on a result still registers.
            blurTimer.current = window.setTimeout(() => setOpen(false), 100);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              if (!open) {
                e.preventDefault();
                setOpen(true);
              }
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="learning-search-input"
        />
        {action}
      </div>

      <div className="learning-search-anchor">
        <AnimatePresence>
          {open && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.1 }}
              className="learning-search-results"
            >
              {hasThumbs && (
                // Mouse-down is cancelled so the input keeps focus and the list stays open.
                <div className="learning-search-tools" onMouseDown={(e) => e.preventDefault()}>
                  <div className="learning-view-toggle" role="group" aria-label={t("view")}>
                    <button
                      type="button"
                      aria-pressed={!grid}
                      aria-label={t("listView")}
                      title={t("listTitle")}
                      onClick={() => setView("list")}
                    >
                      <List size={15} strokeWidth={1.6} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-pressed={grid}
                      aria-label={t("thumbView")}
                      title={t("thumbTitle")}
                      onClick={() => setView("thumbs")}
                    >
                      <LayoutGrid size={15} strokeWidth={1.6} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
              <Command.List className={grid ? "scrollbar-hide is-grid" : "scrollbar-hide"}>
                <Command.Empty>{emptyText}</Command.Empty>
                {grid ? (
                  <Command.Group className="learning-search-group is-grid">
                    {items.map((entry) => (
                      <Command.Item
                        key={entry.id}
                        value={entry.id}
                        onSelect={() => handlePick(entry)}
                        title={entry.sublabel ? `${entry.label} (${entry.sublabel})` : entry.label}
                      >
                        {entry.item ? (
                          <>
                            <FileThumb item={entry.item} />
                            {isAudio(entry.item.name) && <AudioPlayButton item={entry.item} />}
                          </>
                        ) : (
                          <span className="learning-thumb-box">
                            <Folder size={28} strokeWidth={1.4} aria-hidden="true" className="learning-tile-folder" />
                          </span>
                        )}
                        <span className="learning-thumb-name">{entry.label}</span>
                        {entry.sublabel && <span className="learning-result-tile-sub">{entry.sublabel}</span>}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : (
                  <Command.Group className="learning-search-group">
                    {items.map((entry) => (
                      <Command.Item key={entry.id} value={entry.id} onSelect={() => handlePick(entry)}>
                        <span className="learning-result-main">
                          {entry.kind === "folder" ? (
                            <Folder size={15} strokeWidth={1.6} aria-hidden="true" />
                          ) : (
                            <FileText size={15} strokeWidth={1.6} aria-hidden="true" />
                          )}
                          <span>{entry.label}</span>
                        </span>
                        {entry.sublabel && <span className="learning-result-sub">{entry.sublabel}</span>}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Command>
  );
}
