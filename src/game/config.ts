export const config = {
  walk: 2.5,
  run: 4.4,
  shush: 0.95,
  playerRadius: 0.24,
  hearTTL: 2,
  viewDistance: 8.5,
  viewCos: 0.25,
  capture: 0.66,
  patrol: 1.05,
  chase: 3.05,
};
export type Point = { x: number; z: number };
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.z - b.z);
