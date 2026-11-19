import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { AnimatePresence } from "motion/react";
import { Globe, type GlobeItem } from "./components/Globe";
import { FolderSearch } from "./components/FolderSearch";
import { FolderLoader } from "./components/FolderLoader";
import { FilePanel } from "./components/FilePanel";
import { FilePreview } from "./components/FilePreview";
import { rankByLabel, readDroppedFolders, type FileItem, type Folder, type Loaded, type SearchEntry } from "./lib/folders";
import { LanguageProvider, useI18n } from "./lib/i18n";
import { LanguageSwitch } from "./components/LanguageSwitch";
import { HelpButton, InfoButton } from "./components/AppDialogs";

type Listing = { name: string; files: FileItem[] };
type Preview = { item: FileItem; file: File | null; error: boolean };
type IndexedFolder = { folder: string; files: FileItem[] };

// Keys for globe points and matches: "folder:<name>" for subfolders, "file:<name>" for files in the loaded folder.
const folderKey = (name: string) => `folder:${name}`;
const fileKey = (name: string) => `file:${name}`;

const RESULT_LIMIT = 40; // enough matches to fill the thumbnail grid a few rows deep
const FEATURED_FOLDERS = 5;

function Explorer() {
  const { t } = useI18n();
  const [folders, setFolders] = useState<Folder[]>([]);
  // Files directly in the loaded folder (not in a subfolder).
  const [rootFiles, setRootFiles] = useState<FileItem[]>([]);
  const [indexed, setIndexed] = useState<IndexedFolder[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);

  // Globe points: one per subfolder, and one per file directly in the loaded folder.
  const items = useMemo<GlobeItem[]>(
    () => [
      ...folders.map((f) => ({ key: folderKey(f.name), label: f.name })),
      ...rootFiles.map((file) => ({ key: fileKey(file.name), label: file.name })),
    ],
    [folders, rootFiles],
  );

  // Every file of every loaded folder, so the search can find files in any subfolder.
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      folders.map(async (f) => ({ folder: f.name, files: await f.listFiles().catch(() => []) })),
    ).then((all) => {
      if (!cancelled) setIndexed(all);
    });
    return () => {
      cancelled = true;
    };
  }, [folders]);

  const folderEntries = useMemo<SearchEntry[]>(
    () => folders.map((f) => ({ id: `folder:${f.name}`, kind: "folder", label: f.name, folder: f.name })),
    [folders],
  );

  const fileEntries = useMemo<SearchEntry[]>(
    () =>
      indexed.flatMap<SearchEntry>(({ folder, files }) =>
        files.map((item) => ({
          id: `file:${folder}/${item.name}`,
          kind: "file" as const,
          label: item.name,
          sublabel: folder,
          folder,
          item,
        })),
      ).concat(
        rootFiles.map<SearchEntry>((item) => ({ id: `root-file:${item.name}`, kind: "file", label: item.name, item })),
      ),
    [indexed, rootFiles],
  );

  const trimmed = query.trim();

  // Empty query: the first few folders. Otherwise folders and files from any subfolder, ranked by name.
  const results = useMemo(() => {
    if (!trimmed) return folderEntries.slice(0, FEATURED_FOLDERS);
    return rankByLabel([...folderEntries, ...fileEntries], (e) => e.label, trimmed).slice(0, RESULT_LIMIT);
  }, [trimmed, folderEntries, fileEntries]);

  // The globe turns to the best match: its folder, or the file itself when it sits in the loaded folder.
  const best = trimmed ? results[0] : undefined;
  const match = best ? (best.folder ? folderKey(best.folder) : fileKey(best.label)) : null;

  const emptyText = items.length === 0 ? t("emptyNoFolders") : t("emptyNoResults");

  const load = useCallback((next: Loaded) => {
    setFolders(next.folders);
    setRootFiles(next.files);
    setSelected(null);
    setListing(null);
    setPreview(null);
  }, []);

  // Read the files of the selected subfolder.
  useEffect(() => {
    if (!selected) return;
    const folder = folders.find((f) => f.name === selected);
    if (!folder) return;
    let cancelled = false;
    folder
      .listFiles()
      .then((files) => {
        if (!cancelled) setListing({ name: folder.name, files });
      })
      .catch(() => {
        if (!cancelled) setListing({ name: folder.name, files: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [selected, folders]);

  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const next = await readDroppedFolders(e.dataTransfer.items);
    if (next.folders.length || next.files.length) load(next);
  };

  const files = selected && listing?.name === selected ? listing.files : null;

  // The file list closes on any click outside itself. The capture phase runs before
  // the click's own handler, so clicking another folder on the globe still opens its list.
  // While a file is open in the popup, the list stays put.
  const belowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!selected || preview) return;
    const onPointerDown = (e: globalThis.PointerEvent) => {
      if (belowRef.current?.contains(e.target as Node)) return;
      setSelected(null);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [selected, preview]);

  const openFile = useCallback((item: FileItem) => {
    setPreview({ item, file: null, error: false });
    item
      .open()
      .then((file) => setPreview((p) => (p?.item === item ? { item, file, error: false } : p)))
      .catch(() => setPreview((p) => (p?.item === item ? { item, file: null, error: true } : p)));
  }, []);

  // A folder point selects that folder. A file point opens the file instead.
  const onGlobePick = useCallback(
    (key: string | null) => {
      if (key === null) {
        setSelected(null);
        return;
      }
      if (key.startsWith("file:")) {
        setSelected(null);
        const file = rootFiles.find((f) => fileKey(f.name) === key);
        if (file) openFile(file);
        return;
      }
      setSelected(key.slice("folder:".length));
    },
    [rootFiles, openFile],
  );

  const closePreview = useCallback(() => setPreview(null), []);

  // Picking a folder selects it on the globe. Picking a file opens it, and selects its folder first.
  const pick = useCallback(
    (entry: SearchEntry) => {
      if (entry.folder) setSelected(entry.folder);
      if (entry.item) openFile(entry.item);
    },
    [openFile],
  );

  return (
    <div className="learning-landing" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      <section className="learning-hero" aria-labelledby="learning-title">
        <div className="learning-topbar">
          <HelpButton />
          <LanguageSwitch />
        </div>
        <div className="learning-world">
          <Globe
            items={items}
            query={query}
            match={match}
            selected={selected ? folderKey(selected) : null}
            onSelect={onGlobePick}
          />
          <main className="learning-search">
            <h1 id="learning-title">Orbit Files</h1>
            <FolderSearch
              items={results}
              placeholder={t("searchPlaceholder")}
              emptyText={emptyText}
              onPick={pick}
              onInputChange={setQuery}
              action={<FolderLoader count={folders.length} onLoad={load} />}
            />
            <div ref={belowRef} className="learning-below">
              {selected && <FilePanel name={selected} files={files} onOpen={openFile} />}
            </div>
          </main>
        </div>
        <footer className="learning-credit">
          <span>
            {t("poweredBy")} <span className="learning-credit-name">®christianfrank</span>
          </span>
          <div className="learning-credit-links">
            <InfoButton />
            <a
              className="learning-credit-github"
              href="https://github.com/ccnfrank"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("githubLabel")}
              title={t("githubLabel")}
            >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <span>github.com/ccnfrank</span>
            </a>
          </div>
        </footer>
      </section>

      <AnimatePresence>
        {preview && (
          <FilePreview
            key={preview.item.name}
            item={preview.item}
            file={preview.file}
            error={preview.error}
            onClose={closePreview}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Explorer />
    </LanguageProvider>
  );
}
