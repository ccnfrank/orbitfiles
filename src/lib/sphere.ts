/**
 * Globe geometry: one point per subfolder, spread over the sphere with a
 * golden-angle spiral, plus the projection used by the canvas renderer.
 */

export type SpherePoint = {
  x: number;
  y: number;
  z: number;
};

const GOLDEN_ANGLE_DEG = 137.507764;

/** Point number `i` of `n` on the unit sphere. */
export function folderPoint(i: number, n: number): SpherePoint {
  const sinLat = 1 - ((i + 0.5) / n) * 2;
  const lat = Math.asin(sinLat);
  const lonRad = (((i * GOLDEN_ANGLE_DEG) % 360) - 180) * (Math.PI / 180);
  const cosLat = Math.cos(lat);
  return {
    x: cosLat * Math.sin(lonRad),
    y: sinLat,
    z: cosLat * Math.cos(lonRad),
  };
}

/** Rotate around the vertical axis (yaw), then tilt (pitch). Returns screen-space
 *  offsets relative to the centre in units of the radius, plus depth (+ = facing viewer). */
export function projectPoint(p: SpherePoint, yaw: number, pitch: number) {
  const sy = Math.sin(yaw);
  const cy = Math.cos(yaw);
  const sp = Math.sin(pitch);
  const cp = Math.cos(pitch);
  const sx = p.x * cy + p.z * sy;
  const sz = p.z * cy - p.x * sy;
  return {
    sx,
    sy: p.y * cp - sz * sp,
    depth: p.y * sp + sz * cp,
  };
}

/** Yaw/pitch that bring a sphere point to the front of the view. */
export function viewFor(p: SpherePoint) {
  return {
    yaw: -Math.atan2(p.x, p.z),
    pitch: Math.asin(p.y) - Math.asin(0.6),
  };
}

export function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}
