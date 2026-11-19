/**
 * Folder search and folder loading. A loaded folder gives one `Folder` per
 * subfolder. Its file list and file contents are read lazily, on demand.
 */

export type FileItem = {
  name: string;
  /** Reads the file. Called only when the user opens it. */
  open: () => Promise<File>;
};

export type Folder = {
  name: string;
  listFiles: () => Promise<FileItem[]>;
};

/** What a load gives: the subfolders of the loaded folder, and the files that sit directly in it. */
export type Loaded = {
  folders: Folder[];
  files: FileItem[];
};

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

export function sortNames(names: Iterable<string>): string[] {
  return [...names].sort((a, b) => collator.compare(a, b));
}

function sortFiles(files: FileItem[]): FileItem[] {
  return files.sort((a, b) => collator.compare(a.name, b.name));
}

/** Ranked search over any items with a label: prefix match, then substring.
 *  Every query token must appear in the label. */
export function rankByLabel<T>(items: T[], label: (item: T) => string, query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/);

  return items
    .map((item) => {
      const text = label(item);
      const lower = text.toLowerCase();
      if (!tokens.every((t) => lower.includes(t))) return null;
      const score = lower.startsWith(q) ? 3 : lower.includes(q) ? 2 : 1;
      return { item, score, text };
    })
    .filter((x): x is { item: T; score: number; text: string } => x !== null)
    .sort((a, b) => b.score - a.score || collator.compare(a.text, b.text))
    .map((x) => x.item);
}

export function searchFolders(names: string[], query: string): string[] {
  return rankByLabel(names, (n) => n, query);
}

/** One row of the search dropdown: a folder (a globe point) or a file. */
export type SearchEntry = {
  id: string;
  kind: "folder" | "file";
  label: string;
  sublabel?: string;
  /** Folder to select when the entry is picked. */
  folder?: string;
  /** File to open when the entry is picked. */
  item?: FileItem;
};

// ---------- Native folder picker (Chromium) ----------

type Entry = { kind: "file" | "directory"; name: string };
type DirEntry = Entry & { values(): AsyncIterable<Entry> };
type FileEntry = Entry & { getFile(): Promise<File> };
type PickerWindow = {
  showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<DirEntry>;
};

export function supportsDirectoryPicker(): boolean {
  return typeof (window as unknown as PickerWindow).showDirectoryPicker === "function";
}

/** Every file under `dir`, at any depth. Names are paths relative to `dir`. */
async function walkFiles(dir: DirEntry, prefix: string, out: FileItem[]): Promise<void> {
  for await (const entry of dir.values()) {
    const path = prefix + entry.name;
    if (entry.kind === "file") {
      const handle = entry as FileEntry;
      out.push({ name: path, open: () => handle.getFile() });
    } else {
      await walkFiles(entry as DirEntry, path + "/", out);
    }
  }
}

async function listChildFiles(dir: DirEntry): Promise<FileItem[]> {
  const files: FileItem[] = [];
  await walkFiles(dir, "", files);
  return sortFiles(files);
}

/** Subfolders and direct files of the folder the user picks. Resolves to null when the picker is cancelled.
 *  Lists empty subfolders too. */
export async function pickDirectoryFolders(): Promise<Loaded | null> {
  const picker = (window as unknown as PickerWindow).showDirectoryPicker;
  if (!picker) return null;
  try {
    const root = await picker({ mode: "read" });
    const dirs: DirEntry[] = [];
    const files: FileItem[] = [];
    for await (const entry of root.values()) {
      if (entry.kind === "directory") {
        dirs.push(entry as DirEntry);
      } else {
        const handle = entry as FileEntry;
        files.push({ name: entry.name, open: () => handle.getFile() });
      }
    }
    return {
      folders: dirs
        .sort((a, b) => collator.compare(a.name, b.name))
        .map((dir) => ({ name: dir.name, listFiles: () => listChildFiles(dir) })),
      files: sortFiles(files),
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return null;
    throw err;
  }
}

// ---------- Directory file input (Firefox, Safari) ----------

/** Subfolders and direct files from a list picked with `<input webkitdirectory>`. Paths look like
 *  "root/sub/file": a subfolder is segment 1 of any path at least 3 segments deep, and a file
 *  directly in the loaded folder is "root/file", exactly 2 segments. Browsers only report
 *  folders that contain files, so empty subfolders are missed here. */
export function foldersFromFileList(files: FileList | File[]): Loaded {
  // Each entry keeps the path relative to its subfolder, so nested files stay distinguishable.
  const byName = new Map<string, { path: string; file: File }[]>();
  const direct: FileItem[] = [];
  for (const file of Array.from(files)) {
    const parts = (file.webkitRelativePath || "").split("/");
    if (parts.length === 2 && parts[1]) {
      direct.push({ name: parts[1], open: async () => file });
      continue;
    }
    if (parts.length < 3 || !parts[1]) continue;
    const list = byName.get(parts[1]) ?? [];
    list.push({ path: parts.slice(2).join("/"), file });
    byName.set(parts[1], list);
  }
  return {
    folders: [...byName.keys()]
      .sort((a, b) => collator.compare(a, b))
      .map((name) => ({
        name,
        listFiles: async () =>
          sortFiles((byName.get(name) ?? []).map(({ path, file }) => ({ name: path, open: async () => file }))),
      })),
    files: sortFiles(direct),
  };
}

// ---------- Drag and drop ----------

function readAllEntries(dir: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  const reader = dir.createReader();
  const out: FileSystemEntry[] = [];
  return new Promise((resolve, reject) => {
    const next = () =>
      reader.readEntries((batch) => {
        if (batch.length === 0) {
          resolve(out);
          return;
        }
        out.push(...batch);
        next();
      }, reject);
    next();
  });
}

/** Every file under a dropped folder, at any depth. Names are paths relative to `dir`. */
async function walkDropped(dir: FileSystemDirectoryEntry, prefix: string, out: FileItem[]): Promise<void> {
  const entries = await readAllEntries(dir);
  for (const entry of entries) {
    const path = prefix + entry.name;
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      out.push({
        name: path,
        open: () => new Promise<File>((resolve, reject) => fileEntry.file(resolve, reject)),
      });
    } else if (entry.isDirectory) {
      await walkDropped(entry as FileSystemDirectoryEntry, path + "/", out);
    }
  }
}

async function listDroppedFiles(dir: FileSystemDirectoryEntry): Promise<FileItem[]> {
  const files: FileItem[] = [];
  await walkDropped(dir, "", files);
  return sortFiles(files);
}

/** Subfolders and direct files of every folder dropped on the page. Entries are read synchronously
 *  from the drop event, before the first await, because the DataTransfer items expire after the event. */
export async function readDroppedFolders(items: DataTransferItemList): Promise<Loaded> {
  const roots: FileSystemDirectoryEntry[] = [];
  for (const item of Array.from(items)) {
    const entry = item.webkitGetAsEntry?.();
    if (entry?.isDirectory) roots.push(entry as FileSystemDirectoryEntry);
  }

  const children = new Map<string, FileSystemDirectoryEntry>();
  const direct: FileItem[] = [];
  const lists = await Promise.all(roots.map(readAllEntries));
  for (const list of lists) {
    for (const entry of list) {
      if (entry.isDirectory) {
        children.set(entry.name, entry as FileSystemDirectoryEntry);
      } else if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        direct.push({
          name: entry.name,
          open: () => new Promise<File>((resolve, reject) => fileEntry.file(resolve, reject)),
        });
      }
    }
  }

  return {
    folders: [...children.entries()]
      .sort(([a], [b]) => collator.compare(a, b))
      .map(([name, dir]) => ({ name, listFiles: () => listDroppedFiles(dir) })),
    files: sortFiles(direct),
  };
}
