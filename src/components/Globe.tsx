import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { folderPoint, projectPoint, viewFor, wrapAngle, type SpherePoint } from "../lib/sphere";
import { useI18n } from "../lib/i18n";

/** One clickable point on the globe: a loaded subfolder, or a file directly in the loaded folder. */
export type GlobeItem = {
  /** Unique key, passed back to onSelect and used for match and selection. */
  key: string;
  label: string;
};

type Props = {
  /** The subfolders and root files of the loaded folder. Each one is a clickable point on the globe. */
  items: GlobeItem[];
  /** Raw search input. Non-matching folders are dimmed while it is non-empty. */
  query: string;
  /** Best folder for the query; the globe turns to face it. */
  match: string | null;
  selected: string | null;
  onSelect: (key: string | null) => void;
};

type Hit = { index: number; x: number; y: number; depth: number };
type Drag = {
  id: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  /** Set once the pointer has moved past the threshold. */
  active: boolean;
  /** Point under the press, selected on release if the press never became a drag. */
  index: number | null;
};

const FRAME_MS = 1000 / 24; // redraw rate, same as the reference
const DAMPING_MS = 150; // easing constant for tilt and focus turns
const SPIN_PER_MS = (2 * Math.PI) / 60_000; // one full 360° turn every 60 seconds, in radians per millisecond
const START_YAW = -0.18;
const FRONT_DEPTH = 0.12; // points past this depth face the viewer
const RADIUS_RATIO = 0.455; // globe radius as a share of the canvas width
// Background dots that give the sphere its texture. Dimmer and smaller than the folder points.
const AMBIENT_COUNT = 2000;
const AMBIENT = Array.from({ length: AMBIENT_COUNT }, (_, i) => folderPoint(i, AMBIENT_COUNT));
// Radar pings from folder points: one cycle every PING_MS, PING_RINGS rings per cycle, from PING_MIN to PING_MIN + PING_MAX px.
const PING_MS = 2400;
const PING_RINGS = 2;
const PING_MIN = 3;
const PING_MAX = 22;
const DRAG_THRESHOLD = 4; // px a press must travel before it counts as a drag, not a click
const DRAG_PITCH_LIMIT = 1.1; // radians; how far a drag can tilt the globe
const SPIN_RESUME_MS = 1500; // the auto spin waits this long after a drag is released
/** Slow brightness flicker for one folder point: between about 0.7 and 1, each point on its own rhythm. */
const twinkle = (seconds: number, index: number) => 0.85 + 0.15 * Math.sin(seconds * 1.6 + index * 2.399);
const clampLeft = (x: number) => `clamp(92px, ${x}px, calc(100% - 92px))`;

export function Globe({ items, query, match, selected, onSelect }: Props) {
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeTipRef = useRef<HTMLDivElement>(null);
  const matchTipRef = useRef<HTMLDivElement>(null);

  const normalized = query.trim().toLowerCase();
  const points = useMemo<SpherePoint[]>(
    () => items.map((_, i) => folderPoint(i, items.length)),
    [items],
  );
  const indexOfKey = (key: string | null) => (key ? items.findIndex((item) => item.key === key) : -1);
  const selectedIdx = indexOfKey(selected);
  const matchIdx = indexOfKey(match);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const activeIdx = hoverIdx ?? (selectedIdx >= 0 ? selectedIdx : null);

  // Mirrors read by the animation loop, so the loop never has to re-subscribe.
  const itemsRef = useRef(items);
  const pointsRef = useRef(points);
  const queryRef = useRef(normalized);
  const matchRef = useRef(matchIdx);
  const selectedRef = useRef(selectedIdx);
  const hoverRef = useRef<number | null>(null);
  const frontRef = useRef<Hit[]>([]);
  // Yaw/pitch shared by the render loop and the drag handlers.
  const viewRef = useRef({ yaw: START_YAW, pitch: 0, size: 0 });
  const dragRef = useRef<Drag | null>(null);
  // The auto spin stays off until this time (on the animation clock), so it resumes after a drag.
  const spinResumeAt = useRef(0);
  const drawRef = useRef<() => void>(() => {});
  itemsRef.current = items;
  pointsRef.current = points;
  queryRef.current = normalized;
  matchRef.current = matchIdx;
  selectedRef.current = selectedIdx;

  const setHover = (index: number | null) => {
    if (hoverRef.current === index) return;
    hoverRef.current = index;
    setHoverIdx(index);
  };

  // A new folder list invalidates any hovered index.
  useEffect(() => {
    hoverRef.current = null;
    setHoverIdx(null);
  }, [items]);

  // Render + animation loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const view = viewRef.current;
    let visible = true;
    let last = 0;
    let raf = 0;
    let disposed = false;

    const draw = () => {
      const size = view.size;
      if (!size) return;
      const cx = size / 2;
      const radius = size * RADIUS_RATIO;
      const q = queryRef.current;
      const dim = q ? 0.32 : 1;
      const small = size < 500;

      ctx.clearRect(0, 0, size, size);

      // Soft halo behind the sphere.
      const halo = ctx.createRadialGradient(cx, cx, radius * 0.65, cx, cx, radius * 1.1);
      halo.addColorStop(0, "rgba(118, 150, 196, 0)");
      halo.addColorStop(0.8, "rgba(92, 126, 172, 0.045)");
      halo.addColorStop(1, "rgba(118, 150, 196, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, size, size);

      // Light rim: a faint glow that peaks right at the edge of the sphere, with a hairline on top.
      const rim = ctx.createRadialGradient(cx, cx, radius * 0.96, cx, cx, radius * 1.1);
      rim.addColorStop(0, "rgba(170, 206, 240, 0)");
      rim.addColorStop(0.3, "rgba(170, 206, 240, 0.06)");
      rim.addColorStop(1, "rgba(170, 206, 240, 0)");
      ctx.fillStyle = rim;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = "rgba(200, 224, 246, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cx, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Background dots first, so the folder points draw over them.
      for (const p of AMBIENT) {
        const { sx, sy, depth } = projectPoint(p, view.yaw, view.pitch);
        if (depth < 0) continue;
        ctx.fillStyle = `rgba(150, 178, 206, ${(0.08 + depth * 0.3) * dim})`;
        ctx.beginPath();
        ctx.arc(cx + sx * radius, cx - sy * radius, (small ? 0.8 : 0.9) + depth * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Folders: one point per subfolder.
      const positions = pointsRef.current.map((p, index) => {
        const { sx, sy, depth } = projectPoint(p, view.yaw, view.pitch);
        return { index, x: cx + sx * radius, y: cx - sy * radius, depth };
      });
      const hits: Hit[] = [];
      const seconds = performance.now() / 1000;
      for (const h of [...positions].sort((a, b) => a.depth - b.depth)) {
        if (h.depth < -0.12) continue;
        const k = Math.max(0, h.depth);
        const isMatch = !!q && itemsRef.current[h.index].label.toLowerCase().includes(q);
        // Points are brighter than the background dots, with a soft glow on the front side.
        if (!isMatch && k > 0) {
          ctx.fillStyle = `rgba(214, 232, 246, ${0.16 * k * dim})`;
          ctx.beginPath();
          ctx.arc(h.x, h.y, 4.5 + k * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = isMatch
          ? `rgba(164, 236, 222, ${0.6 + k * 0.4})`
          : `rgba(236, 246, 255, ${(0.75 + k * 0.25) * dim * twinkle(seconds, h.index)})`;
        ctx.beginPath();
        ctx.arc(h.x, h.y, (small ? 2 : 2.2) + k * 1.2 + (isMatch ? 1 : 0), 0, Math.PI * 2);
        ctx.fill();
        if (h.depth > FRONT_DEPTH) hits.push(h);
      }
      frontRef.current = hits;

      // Radar pings: rings that spread out from each point on the front of the globe.
      // Every point has its own phase, so the pings don't fire in step.
      if (!reduceMotion.matches) {
        const now = performance.now();
        for (const h of hits) {
          const k = Math.max(0, h.depth);
          const phase = (h.index * 0.618034) % 1;
          for (let j = 0; j < PING_RINGS; j++) {
            const p = (now / PING_MS + phase + j / PING_RINGS) % 1;
            ctx.strokeStyle = `rgba(190, 226, 250, ${0.55 * (1 - p) * (1 - p) * (0.4 + k * 0.6) * dim})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(h.x, h.y, PING_MIN + p * PING_MAX, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      // Search match: ring plus tooltip position.
      const mIdx = matchRef.current;
      const mh = mIdx >= 0 ? positions[mIdx] : undefined;
      const matchTip = matchTipRef.current;
      if (matchTip && mh) {
        matchTip.style.visibility = mh.depth > FRONT_DEPTH ? "visible" : "hidden";
        matchTip.style.left = clampLeft(mh.x);
        matchTip.style.top = `${Math.max(48, mh.y - 14)}px`;
      }
      if (mh && mh.depth > FRONT_DEPTH) {
        ctx.strokeStyle = "rgba(182, 241, 228, 0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mh.x, mh.y, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#ddfff4";
        ctx.beginPath();
        ctx.arc(mh.x, mh.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Active folder (hovered, or selected): tooltip plus ring.
      const aIdx = hoverRef.current ?? (selectedRef.current >= 0 ? selectedRef.current : -1);
      const ah = aIdx >= 0 ? positions[aIdx] : undefined;
      const activeTip = activeTipRef.current;
      if (activeTip && ah) {
        activeTip.style.visibility = ah.depth > FRONT_DEPTH ? "visible" : "hidden";
        activeTip.style.left = clampLeft(ah.x);
        activeTip.style.top = `${ah.y - 10}px`;
      }
      if (ah && ah.depth > FRONT_DEPTH) {
        ctx.strokeStyle = "rgba(193, 233, 232, 0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ah.x, ah.y, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#d9f6ef";
        ctx.beginPath();
        ctx.arc(ah.x, ah.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawRef.current = draw;

    const resize = () => {
      const width = canvas.getBoundingClientRect().width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      view.size = width;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(width * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const tick = (now: number) => {
      if (disposed) return;
      if (now - last >= FRAME_MS) {
        const dt = Math.min(now - last, 80);
        last = now;
        const reduce = reduceMotion.matches;

        // While the pointer is dragging, the drag handler moves the globe and nothing else does.
        if (visible && !document.hidden && !dragRef.current?.active) {
          const m = matchRef.current;
          const pts = pointsRef.current;
          if (m >= 0 && pts[m]) {
            // Turn until the matched folder faces the viewer.
            const target = viewFor(pts[m]);
            const dYaw = wrapAngle(target.yaw - view.yaw);
            const dPitch = target.pitch - view.pitch;
            if (Math.abs(dYaw) + Math.abs(dPitch) > 1e-4) {
              const k = reduce ? 1 : 1 - Math.exp(-dt / DAMPING_MS);
              view.yaw += dYaw * k;
              view.pitch += dPitch * k;
            }
          } else {
            // No search match: ease the tilt back to level and spin constantly.
            // Hover and selection don't stop the spin; the tooltips follow the moving point.
            view.pitch *= reduce ? 0 : Math.exp(-dt / DAMPING_MS);
            if (!reduce && now >= spinResumeAt.current) view.yaw += dt * SPIN_PER_MS;
          }
          // Drawn every frame, so the radar pings keep moving even while the globe is still.
          draw();
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);
    reduceMotion.addEventListener("change", draw);

    resize();
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      reduceMotion.removeEventListener("change", draw);
      drawRef.current = () => {};
    };
  }, []);

  // Redraw after DOM updates so tooltip elements that just appeared get positioned before paint.
  useLayoutEffect(() => {
    drawRef.current();
  }, [items, normalized, matchIdx, selectedIdx, activeIdx]);

  const pick = (e: PointerEvent<HTMLCanvasElement>): number | null => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    let best: number | null = null;
    let bestDist = e.pointerType === "touch" ? 30 : 16;
    for (const h of frontRef.current) {
      const d = Math.hypot(h.x - px, h.y - py);
      if (d < bestDist) {
        best = h.index;
        bestDist = d;
      }
    }
    return best;
  };

  const cycle = (step: number) => {
    const list = frontRef.current.filter((h) => h.depth > 0.25);
    if (!list.length) return;
    const idx = list.findIndex((h) => h.index === hoverRef.current);
    const next = idx < 0 ? list[0] : list[(idx + step + list.length) % list.length];
    setHover(next.index);
  };

  // Press, drag and release. A press that never moves past the threshold is a click and selects
  // the point under it. A press that moves turns the globe with the pointer instead.
  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    dragRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      active: false,
      index: pick(e),
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (drag && drag.id === e.pointerId) {
      if (!drag.active) {
        if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD) return;
        drag.active = true;
        // Clear any text the browser already selected when the drag began.
        window.getSelection()?.removeAllRanges();
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.style.cursor = "grabbing";
        setHover(null);
      }
      const view = viewRef.current;
      const radius = view.size * RADIUS_RATIO;
      if (!radius) return;
      const dx = e.clientX - drag.lastX;
      const dy = e.clientY - drag.lastY;
      // Move the surface under the pointer: a drag of one radius turns the globe one radian.
      view.yaw += dx / radius;
      view.pitch = Math.max(-DRAG_PITCH_LIMIT, Math.min(DRAG_PITCH_LIMIT, view.pitch - dy / radius));
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      drawRef.current();
      return;
    }
    if (e.pointerType !== "touch") setHover(pick(e));
  };

  const endDrag = (e: PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    dragRef.current = null;
    e.currentTarget.style.cursor = "";
    if (drag.active) {
      // Released: the auto spin stays off for a moment, then carries on from where the drag left the globe.
      spinResumeAt.current = performance.now() + SPIN_RESUME_MS;
      return;
    }
    if (e.type === "pointercancel") return;
    if (drag.index === null) {
      onSelect(null); // clicking empty sphere clears the selection
      return;
    }
    if (e.pointerType === "touch") setHover(drag.index);
    onSelect(items[drag.index].key);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      cycle(e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1);
    } else if ((e.key === "Enter" || e.key === " ") && hoverRef.current !== null) {
      e.preventDefault();
      onSelect(items[hoverRef.current].key);
    } else if (e.key === "Escape") {
      setHover(null);
      onSelect(null);
    }
  };

  return (
    <div
      ref={rootRef}
      className="topic-globe"
      onPointerLeave={(e) => {
        if (e.pointerType !== "touch") setHover(null);
      }}
    >
      <canvas
        ref={canvasRef}
        className="topic-globe-canvas"
        role="button"
        tabIndex={0}
        aria-label={t("globeLabel")}
        aria-describedby={activeIdx !== null ? "globe-active-tip" : undefined}
        onFocus={() => {
          if (hoverRef.current === null) cycle(1);
        }}
        onBlur={(e) => {
          if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setHover(null);
        }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={endDrag}
        onPointerCancel={(e) => {
          endDrag(e);
          setHover(null);
        }}
        onKeyDown={onKeyDown}
      />

      {match && (
        <div
          ref={matchTipRef}
          className="globe-topic-tooltip globe-search-match"
          aria-live="polite"
          onClick={() => onSelect(match)}
        >
          {items[matchIdx]?.label ?? match}
        </div>
      )}

      {activeIdx !== null && items[activeIdx] !== undefined && (
        <div ref={activeTipRef} id="globe-active-tip" className="globe-topic-tooltip">
          {items[activeIdx].label}
        </div>
      )}
    </div>
  );
}
