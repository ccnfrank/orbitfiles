import { useEffect, useRef } from "react";
import { Folder } from "lucide-react";
import { foldersFromFileList, pickDirectoryFolders, supportsDirectoryPicker, type Loaded } from "../lib/folders";
import { useI18n } from "../lib/i18n";

type Props = {
  count: number;
  onLoad: (loaded: Loaded) => void;
};

/** Folder icon at the end of the search field. Opens the folder picker. Uses the native
 *  picker where available, otherwise a directory file input (Firefox, Safari). */
export function FolderLoader({ count, onLoad }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set as an attribute because React's typings do not declare webkitdirectory.
    inputRef.current?.setAttribute("webkitdirectory", "");
  }, []);

  const { t } = useI18n();
  const label = t("loadFolder");
  const title = count ? t("loadAnother", { count }) : label;

  const choose = async () => {
    if (supportsDirectoryPicker()) {
      const folders = await pickDirectoryFolders();
      if (folders) onLoad(folders);
    } else {
      inputRef.current?.click();
    }
  };

  return (
    <>
      <button type="button" className="learning-load-button" onClick={choose} aria-label={label} title={title}>
        <Folder size={19} strokeWidth={1.6} aria-hidden="true" />
        <span className="learning-load-label">{label}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length) onLoad(foldersFromFileList(files));
          e.target.value = "";
        }}
      />
    </>
  );
}
