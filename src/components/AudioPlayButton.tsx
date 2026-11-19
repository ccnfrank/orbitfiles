import { Pause, Play } from "lucide-react";
import type { FileItem } from "../lib/folders";
import { toggleAudio, useAudioPlaying } from "../lib/audio";
import { useI18n } from "../lib/i18n";

type Props = { item: FileItem };

/** Play/pause for an audio tile. Sits beside the tile's open button, so it never opens the preview. */
export function AudioPlayButton({ item }: Props) {
  const playing = useAudioPlaying(item);
  const { t } = useI18n();
  return (
    <button
      type="button"
      className="learning-thumb-play"
      aria-label={playing ? t("pause", { name: item.name }) : t("play", { name: item.name })}
      title={playing ? t("pauseTitle") : t("playTitle")}
      // Keeps focus where it was, so the search dropdown does not close.
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => {
        // Stops the click from reaching the search row, which would open the file.
        e.stopPropagation();
        void toggleAudio(item);
      }}
    >
      {playing ? <Pause size={16} strokeWidth={1.8} aria-hidden="true" /> : <Play size={16} strokeWidth={1.8} aria-hidden="true" />}
    </button>
  );
}
