import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode, PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from "react";
import { Minus, Plus } from "lucide-react";
import { useI18n } from "../lib/i18n";

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 8;
const KEY_STEP = 1.25;
const WHEEL_SENSITIVITY = 0.002;
const SETTLE_MS = 180;

export type Size = { w: number; h: number };

/** What the content looks like right now, once zooming has paused. Used to pick the render resolution. */
export type Settled = { zoom: number; width: number; height: number };

type View = { zoom: number; x: number; y: number };

type Props = {
  /** Size of the content at zoom 1, for the current viewport size. The content fills this box. */
  fit: (viewportW: number, viewportH: number) => Size;
  children: (settled: Settled) => ReactNode;
};

function clampNumber(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Keeps the content inside the viewport: centered when it is smaller, never pulled past its edges when larger. */
function clampView(v: View, vw: number, vh: number, base: Size): View {
  const w = base.w * v.zoom;
  const h = base.h * v.zoom;
  const x = w <= vw ? (vw - w) / 2 : clampNumber(v.x, vw - w, 0);
  const y = h <= vh ? (vh - h) / 2 : clampNumber(v.y, vh - h, 0);
  return { zoom: v.zoom, x, y };
}

/**
 * A viewport where the content zooms with the mouse wheel (around the pointer) and moves when
 * dragged with the mouse button held. Double-click resets. The +, − and 0 keys and the toolbar do the same.
 */
export function ZoomView({ fit, children }: Props) {
  const { t } = useI18n();
  const viewerRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef(fit);
  fitRef.current = fit;
  const viewRef = useRef<View>({ zoom: 1, x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const [view, setView] = useState<View>(viewRef.current);
  const [viewport, setViewport] = useState<Size>({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [settled, setSettled] = useState<Settled>({ zoom: 1, width: 0, height: 0 });

  /** Clamps and stores a new view. Skips the update when nothing changed, so effects can call it freely. */
  const commit = useCallback((next: View) => {
    const el = viewerRef.current;
    if (!el) return;
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const clamped = clampView(next, vw, vh, fitRef.current(vw, vh));
    const prev = viewRef.current;
    if (clamped.zoom === prev.zoom && clamped.x === prev.x && clamped.y === prev.y) return;
    viewRef.current = clamped;
    setView(clamped);
  }, []);

  /** Zooms by `factor`, keeping the point at (px, py) of the viewer fixed on screen. */
  const zoomAt = useCallback(
    (px: number, py: number, factor: number) => {
      const v = viewRef.current;
      const zoom = clampNumber(v.zoom * factor, MIN_ZOOM, MAX_ZOOM);
      const ratio = zoom / v.zoom;
      commit({ zoom, x: px - (px - v.x) * ratio, y: py - (py - v.y) * ratio });
    },
    [commit],
  );

  const zoomAtCenter = useCallback(
    (factor: number) => {
      const el = viewerRef.current;
      if (!el) return;
      zoomAt(el.clientWidth / 2, el.clientHeight / 2, factor);
    },
    [zoomAt],
  );

  const reset = useCallback(() => commit({ zoom: 1, x: 0, y: 0 }), [commit]);

  // Track the viewport size. Re-clamp on every render too, since the content size can change without a resize.
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    const measure = () => setViewport({ w: el.clientWidth, h: el.clientHeight });
    const observer = new ResizeObserver(() => {
      measure();
      commit(viewRef.current);
    });
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, [commit]);

  useEffect(() => {
    commit(viewRef.current);
  });

  // Wheel zoom. Registered directly with passive: false so the page does not scroll underneath.
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-delta * WHEEL_SENSITIVITY));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") zoomAtCenter(KEY_STEP);
      else if (e.key === "-") zoomAtCenter(1 / KEY_STEP);
      else if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomAtCenter, reset]);

  // Settle the render size a moment after zooming stops, so PDFs are not re-rendered on every wheel tick.
  const base = viewport.w > 0 ? fit(viewport.w, viewport.h) : { w: 0, h: 0 };
  useEffect(() => {
    const id = window.setTimeout(
      () => setSettled({ zoom: view.zoom, width: base.w * view.zoom, height: base.h * view.zoom }),
      SETTLE_MS,
    );
    return () => window.clearTimeout(id);
  }, [view.zoom, base.w, base.h]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    drag.current = { px: e.clientX, py: e.clientY, x: viewRef.current.x, y: viewRef.current.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    commit({ ...viewRef.current, x: d.x + e.clientX - d.px, y: d.y + e.clientY - d.py });
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  const onDoubleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (viewRef.current.zoom > MIN_ZOOM) {
      reset();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, 2);
  };

  // The toolbar sits inside the viewer, so its clicks must not start a drag.
  const stop = (e: ReactPointerEvent<HTMLDivElement> | ReactMouseEvent<HTMLDivElement>) => e.stopPropagation();

  return (
    <div
      ref={viewerRef}
      className={dragging ? "learning-zoom is-dragging" : "learning-zoom"}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={onDoubleClick}
    >
      {viewport.w > 0 && (
        <div
          className="learning-zoom-stage"
          style={{
            width: base.w,
            height: base.h,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
          }}
        >
          {children(settled)}
        </div>
      )}
      <div className="learning-zoom-tools" onPointerDown={stop} onDoubleClick={stop}>
        <button
          type="button"
          onClick={() => zoomAtCenter(1 / KEY_STEP)}
          disabled={view.zoom <= MIN_ZOOM}
          aria-label={t("zoomOut")}
          title={t("zoomOut")}
        >
          <Minus size={15} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <button type="button" className="learning-zoom-level" onClick={reset} title={t("zoomReset")}>
          {Math.round(view.zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={() => zoomAtCenter(KEY_STEP)}
          disabled={view.zoom >= MAX_ZOOM}
          aria-label={t("zoomIn")}
          title={t("zoomIn")}
        >
          <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
