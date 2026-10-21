import { config, distance, type Point } from './config';
import { lineClear } from './level';
export function canSee(from: Point, heading: number, target: Point, hidden: boolean) {
  const d = distance(from, target);
  if (hidden || d > config.viewDistance || !lineClear(from, target)) return false;
  if (d < 1.2) return true;
  return (
    ((target.x - from.x) * Math.sin(heading) + (target.z - from.z) * Math.cos(heading)) / d >=
    config.viewCos
  );
}
