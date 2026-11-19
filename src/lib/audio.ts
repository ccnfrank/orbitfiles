/**
 * One shared audio player for the thumbnail grids. Only one file plays at a time.
 * Components subscribe to it through the hooks below, so tiles update when playback changes.
 */
import { useSyncExternalStore } from "react";
import type { FileItem } from "./folders";
import { extOf } from "./thumbnails";

export const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "oga", "m4a", "flac", "aac", "opus"]);

export function isAudio(name: string): boolean {
  return AUDIO_EXTENSIONS.has(extOf(name));
}

const audio = typeof Audio !== "undefined" ? new Audio() : null;
let active: FileItem | null = null;
let objectUrl: string | null = null;
let request = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

if (audio) {
  for (const type of ["play", "pause", "ended", "emptied", "timeupdate", "durationchange", "loadedmetadata"]) {
    audio.addEventListener(type, emit);
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Play or pause `item`. Starting a different file stops the current one. */
export async function toggleAudio(item: FileItem): Promise<void> {
  if (!audio) return;
  if (active === item) {
    if (audio.paused) await audio.play().catch(() => {});
    else audio.pause();
    return;
  }
  const mine = ++request;
  let file: File;
  try {
    file = await item.open();
  } catch {
    return;
  }
  if (mine !== request) return; // a newer request has taken over
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  active = item;
  audio.src = objectUrl;
  await audio.play().catch(() => {});
  emit();
}

/** True while `item` is the file that is playing. */
export function useAudioPlaying(item: FileItem): boolean {
  return useSyncExternalStore(subscribe, () => active === item && !!audio && !audio.paused, () => false);
}

/** Playback position of `item` from 0 to 1, or 0 when it is not the current file. */
export function useAudioProgress(item: FileItem): number {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (active !== item || !audio || !audio.duration || !isFinite(audio.duration)) return 0;
      return Math.min(1, audio.currentTime / audio.duration);
    },
    () => 0,
  );
}
