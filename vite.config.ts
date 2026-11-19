import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";

/** The default folder: `def_folder/` next to this file. The app loads it on start. */
const SOURCE = fileURLToPath(new URL("./def_folder", import.meta.url));
/** URL prefix the app fetches the default folder from, without the leading slash. */
const URL_DIR = "def-folder";
const INDEX = "index.json";

type Entry = { name: string; url: string };
type Tree = { folders: { name: string; files: Entry[] }[]; files: Entry[] };

const MIME: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp",
  svg: "image/svg+xml", tif: "image/tiff", tiff: "image/tiff", bmp: "image/bmp", avif: "image/avif",
  pdf: "application/pdf", mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4",
  aac: "audio/aac", flac: "audio/flac", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
  txt: "text/plain", md: "text/markdown", json: "application/json", csv: "text/csv",
};

/** Hidden files and folders (such as .DS_Store) are left out. */
const visible = (dirent: fs.Dirent) => !dirent.name.startsWith(".");

const byName = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

/** Every file under `dir`, at any depth, as paths relative to `dir`. */
function filesUnder(dir: string, prefix = ""): string[] {
  const out: string[] = [];
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true }).filter(visible)) {
    const rel = prefix + dirent.name;
    if (dirent.isDirectory()) out.push(...filesUnder(path.join(dir, dirent.name), rel + "/"));
    else if (dirent.isFile()) out.push(rel);
  }
  return out;
}

/** Encodes each path segment, so names with spaces or # stay valid in a URL. */
const encodePath = (rel: string) => rel.split("/").map(encodeURIComponent).join("/");

/** The folder tree the app reads: subfolders with their files, and the files directly inside. */
function buildTree(): Tree {
  if (!fs.existsSync(SOURCE)) return { folders: [], files: [] };
  const entries = fs.readdirSync(SOURCE, { withFileTypes: true }).filter(visible);
  const entryFor = (rel: string): Entry => ({ name: rel, url: `${URL_DIR}/${encodePath(rel)}` });
  return {
    folders: entries
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort(byName)
      .map((name) => ({
        name,
        // Names inside a subfolder are relative to it, as in the folder picker.
        files: filesUnder(path.join(SOURCE, name))
          .sort(byName)
          .map((rel) => ({ name: rel, url: `${URL_DIR}/${encodePath(`${name}/${rel}`)}` })),
      })),
    files: entries
      .filter((f) => f.isFile())
      .map((f) => f.name)
      .sort(byName)
      .map(entryFor),
  };
}

/** Serves the manifest and the files, for dev and preview. Paths outside `def_folder/` are refused. */
function serveDefaultFolder(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  if (pathname === `/${INDEX}`) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(buildTree()));
    return;
  }
  const full = path.resolve(SOURCE, pathname.slice(1));
  if (!full.startsWith(SOURCE + path.sep) || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
    next();
    return;
  }
  const ext = path.extname(full).slice(1).toLowerCase();
  res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream");
  fs.createReadStream(full).pipe(res);
}

/** Dev and preview serve `def_folder/` live. The build copies it into `dist/`. */
function defaultFolder(): Plugin {
  return {
    name: "default-folder",
    configureServer(server) {
      server.middlewares.use(`/${URL_DIR}`, serveDefaultFolder);
    },
    configurePreviewServer(server) {
      server.middlewares.use(`/${URL_DIR}`, serveDefaultFolder);
    },
    generateBundle() {
      if (!fs.existsSync(SOURCE)) return;
      this.emitFile({ type: "asset", fileName: `${URL_DIR}/${INDEX}`, source: JSON.stringify(buildTree()) });
      for (const rel of filesUnder(SOURCE)) {
        this.emitFile({
          type: "asset",
          fileName: `${URL_DIR}/${rel}`,
          source: fs.readFileSync(path.join(SOURCE, rel)),
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), defaultFolder()],
});
