import { Entity, Vec3 } from 'playcanvas';
import { walkable, lineClear } from './level';
import type { Point } from './config';
export class FollowCamera {
  entity: Entity;
  position = new Vec3();
  initialized = false;
  constructor(entity: Entity) {
    this.entity = entity;
  }
  tick(dt: number, p: Point, yaw: number, pitch: number) {
    const target = new Vec3(p.x, 1.38, p.z);
    let d = 0.25;
    for (let probe = 0.25; probe <= 3.2; probe += 0.08) {
      const q = {
        x: p.x - Math.sin(yaw) * probe + Math.cos(yaw) * 0.22,
        z: p.z - Math.cos(yaw) * probe - Math.sin(yaw) * 0.22,
      };
      if (!walkable(q, 0.35, false) || !walkable(q, 0.1, true)) break;
      d = probe;
    }
    const desired = new Vec3(
      p.x - Math.sin(yaw) * d + Math.cos(yaw) * 0.22,
      Math.min(2.95, 1.55 + Math.sin(pitch) * d + Math.max(0, 2.3 - d) * 0.8),
      p.z - Math.cos(yaw) * d - Math.sin(yaw) * 0.22,
    );
    if (!this.initialized || !walkable({ x: this.position.x, z: this.position.z }, 0.35, false)) {
      this.position.copy(desired);
      this.initialized = true;
    } else this.position.lerp(this.position, desired, 1 - Math.exp(-18 * dt));
    // Smoothing must not pull the probe through a corner.
    if (
      !walkable({ x: this.position.x, z: this.position.z }, 0.35, false) ||
      !lineClear(p, { x: this.position.x, z: this.position.z }, 0.08)
    )
      this.position.copy(desired);
    this.entity.setPosition(this.position);
    this.entity.lookAt(target);
  }
}
