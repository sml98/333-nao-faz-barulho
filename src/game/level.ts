import layout from '../../Tecnico/hotel_bellmare_layout_v1.json';
import { distance, type Point } from './config';
export { layout };
export function inside(p: Point) {
  return layout.zones.some(
    (r) => p.x >= r.x_min && p.x <= r.x_max && p.z >= r.z_min && p.z <= r.z_max,
  );
}
export function walkable(p: Point, r = 0.24, obstacles = true) {
  for (const [x, z] of [
    [0, 0],
    [-r, -r],
    [-r, r],
    [r, -r],
    [r, r],
  ])
    if (!inside({ x: p.x + x, z: p.z + z })) return false;
  return (
    !obstacles ||
    !layout.obstacles.some((o) => Math.abs(p.x - o.x) < 0.34 + r && Math.abs(p.z - o.z) < 0.34 + r)
  );
}
export function move(p: Point, dx: number, dz: number, r = 0.24) {
  const next = { ...p };
  if (walkable({ x: next.x + dx, z: next.z }, r)) next.x += dx;
  if (walkable({ x: next.x, z: next.z + dz }, r)) next.z += dz;
  return next;
}
export function lineClear(a: Point, b: Point, r = 0.05) {
  const n = Math.ceil(distance(a, b) / 0.08);
  for (let i = 0; i <= n; i++) {
    const t = n ? i / n : 0;
    if (!walkable({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t }, r)) return false;
  }
  return true;
}
// Uniform half-meter grid respects the union, including the hall joins. BFS avoids hidden wall shortcuts.
const step = 0.5;
const key = (p: Point) => `${Math.round(p.x / step)},${Math.round(p.z / step)}`;
const decode = (k: string): Point => {
  const [x, z] = k.split(',').map(Number);
  return { x: x * step, z: z * step };
};
export function reachablePoint(p: Point): Point {
  if (walkable(p, 0.27)) return { ...p };
  for (let r = 0.5; r <= 2; r += 0.5)
    for (let n = 0; n < 16; n++) {
      const a = (n * Math.PI) / 8,
        q = {
          x: Math.round((p.x + Math.sin(a) * r) * 2) / 2,
          z: Math.round((p.z + Math.cos(a) * r) * 2) / 2,
        };
      if (walkable(q, 0.27)) return q;
    }
  return { ...p };
}
export function route(start: Point, end: Point): Point[] {
  end = reachablePoint(end);
  if (lineClear(start, end, 0.26)) return [{ ...end }];
  const s = key(start),
    e = key(end),
    queue = [s],
    prev = new Map<string, string | null>([[s, null]]);
  let found = false;
  for (let i = 0; i < queue.length; i++) {
    const k = queue[i];
    if (k === e) {
      found = true;
      break;
    }
    const p = decode(k);
    for (const [dx, dz] of [
      [step, 0],
      [-step, 0],
      [0, step],
      [0, -step],
    ]) {
      const q = { x: p.x + dx, z: p.z + dz },
        id = key(q);
      if (!prev.has(id) && walkable(q, 0.27) && lineClear(p, q, 0.26)) {
        prev.set(id, k);
        queue.push(id);
      }
    }
  }
  if (!found) return [];
  const out: Point[] = [{ ...end }];
  let k: string | null = e;
  while (k && k !== s) {
    out.push(decode(k));
    k = prev.get(k) ?? null;
  }
  out.reverse();
  return out;
}
// Extract only exposed edges of the rectangular union, never walls through joins.
export function boundaries() {
  const edges: { x: number; z: number; horizontal: boolean }[] = [];
  for (let x = -16; x < 16; x += 0.5)
    for (let z = -15; z < 7.5; z += 0.5) {
      if (!inside({ x: x + 0.25, z: z + 0.25 })) continue;
      for (const [dx, dz, horizontal] of [
        [0, -0.5, 1],
        [0, 0.5, 1],
        [-0.5, 0, 0],
        [0.5, 0, 0],
      ]) {
        if (!inside({ x: x + 0.25 + dx, z: z + 0.25 + dz }))
          edges.push({
            x: x + 0.25 + (horizontal ? 0 : dx / 2),
            z: z + 0.25 + (horizontal ? dz / 2 : 0),
            horizontal: !!horizontal,
          });
      }
    }
  return edges;
}
