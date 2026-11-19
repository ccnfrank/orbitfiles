import type { FileItem, Folder, Loaded } from "./folders";

/** What the Vite plugin in vite.config.ts writes for `def_folder/`. URLs are relative to the site root. */
type Manifest = {
  folders: { name: string; files: { name: string; url: string }[] }[];
  files: { name: string; url: string }[];
};

function itemFor(name: string, url: string): FileItem {
  const fileName = name.split("/").pop() || name;
  return {
    name,
    // The bytes are fetched only when the user opens the file.
    open: async () => {
      const res = await fetch(import.meta.env.BASE_URL + url);
      if (!res.ok) throw new Error(`Could not read ${name}`);
      const blob = await res.blob();
      return new File([blob], fileName, { type: blob.type });
    },
  };
}

/** The default folder, `def_folder/` in the project. Null when it is not there. */
export async function loadDefaultFolder(): Promise<Loaded | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}def-folder/index.json`);
    if (!res.ok) return null;
    const manifest = (await res.json()) as Manifest;
    const folders: Folder[] = manifest.folders.map((folder) => {
      const files = folder.files.map((f) => itemFor(f.name, f.url));
      return { name: folder.name, listFiles: async () => files };
    });
    return {
      folders,
      files: manifest.files.map((f) => itemFor(f.name, f.url)),
    };
  } catch {
    // Missing folder or offline: the app starts empty, as before.
    return null;
  }
}
