/**
 * Waveform peaks for audio files, used as their grid thumbnail. Decoded once per file and cached.
 */
import type { FileItem } from "./folders";

export const WAVE_BARS = 48;
const MAX_BYTES = 100 * 1024 * 1024; // larger files are not decoded for a thumbnail

const cache = new WeakMap<FileItem, Promise<number[] | null>>();
let context: AudioContext | null = null;

/** Peaks from 0 to 1, one per bar, or null when the file cannot be decoded. */
export function waveformFor(item: FileItem): Promise<number[] | null> {
  let result = cache.get(item);
  if (!result) {
    result = computePeaks(item);
    cache.set(item, result);
  }
  return result;
}

async function computePeaks(item: FileItem): Promise<number[] | null> {
  try {
    const file = await item.open();
    if (file.size > MAX_BYTES) return null;
    context ??= new AudioContext();
    const buffer = await context.decodeAudioData(await file.arrayBuffer());
    const data = buffer.getChannelData(0);
    const size = Math.max(1, Math.floor(data.length / WAVE_BARS));
    const peaks: number[] = [];
    let max = 0;
    for (let b = 0; b < WAVE_BARS; b++) {
      let peak = 0;
      const end = Math.min(data.length, (b + 1) * size);
      for (let i = b * size; i < end; i++) {
        const v = Math.abs(data[i]);
        if (v > peak) peak = v;
      }
      peaks.push(peak);
      if (peak > max) max = peak;
    }
    if (!max) return null;
    return peaks.map((p) => p / max);
  } catch {
    return null;
  }
}
