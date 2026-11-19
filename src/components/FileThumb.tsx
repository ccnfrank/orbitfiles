import { useEffect, useRef, useState } from "react";
import type { FileItem } from "../lib/folders";
import { THUMB_EXTENSIONS, extOf, thumbnailFor } from "../lib/thumbnails";
import { isAudio, useAudioProgress } from "../lib/audio";
import { waveformFor } from "../lib/waveform";

type Props = { item: FileItem };

/** One thumbnail tile. Images and PDFs get a preview, audio gets a waveform. The preview is
 *  generated only once the tile is near the visible area. */
export function FileThumb({ item }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const ext = extOf(item.name);
  const audio = isAudio(item.name);
  const previewable = audio || THUMB_EXTENSIONS.has(ext);
  const progress = useAudioProgress(item);
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !previewable) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [previewable]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    if (audio) {
      waveformFor(item).then((result) => {
        if (cancelled) return;
        if (result) setPeaks(result);
        else setFailed(true);
      });
    } else {
      thumbnailFor(item).then((result) => {
        if (cancelled) return;
        if (result) setUrl(result);
        else setFailed(true);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [visible, item, audio]);

  return (
    <span ref={ref} className={peaks ? "learning-thumb-box is-audio" : "learning-thumb-box"}>
      {peaks ? (
        <Waveform peaks={peaks} progress={progress} />
      ) : url ? (
        <img src={url} alt="" draggable={false} />
      ) : (
        <span className={previewable && !failed ? "learning-thumb-ph is-loading" : "learning-thumb-ph"}>
          {!previewable || failed ? ext.toUpperCase() || "FILE" : ""}
        </span>
      )}
    </span>
  );
}

/** Bars of the waveform. Bars before the playback position are drawn brighter. */
function Waveform({ peaks, progress }: { peaks: number[]; progress: number }) {
  const n = peaks.length;
  const played = Math.round(progress * n);
  const slot = 100 / n;
  return (
    <svg className="learning-wave" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {peaks.map((peak, i) => {
        const h = Math.max(6, peak * 92);
        return (
          <rect
            key={i}
            className={i < played ? "is-played" : undefined}
            x={i * slot + slot * 0.25}
            y={50 - h / 2}
            width={slot * 0.5}
            height={h}
          />
        );
      })}
    </svg>
  );
}
