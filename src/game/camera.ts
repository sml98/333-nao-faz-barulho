import { Entity, Vec3 } from 'playcanvas';
import { walkable, lineClear } from './level';
import type { Point } from './config';
export class FollowCamera {
  entity: Entity;
  position = new Vec3();
  initialized = false;
  hideNico = false;
  avatarOpacity = 1;
  constructor(entity: Entity) {
    this.entity = entity;
  }
  tick(dt: number, p: Point, yaw: number, pitch: number) {
    const target = new Vec3(p.x, 1.0, p.z);
    let d = 0.25;
    const shoulder = walkable(
      { x: p.x + Math.cos(yaw) * 0.22, z: p.z - Math.sin(yaw) * 0.22 },
      0.16,
    )
      ? 0.22
      : 0;
    for (let probe = 0.25; probe <= 3.45; probe += 0.08) {
      const q = {
        x: p.x - Math.sin(yaw) * probe + Math.cos(yaw) * shoulder,
        z: p.z - Math.cos(yaw) * probe - Math.sin(yaw) * shoulder,
      };
      if (!walkable(q, 0.16, false) || !walkable(q, 0.1, true)) break;
      d = probe;
    }
    const desired = new Vec3(
      p.x - Math.sin(yaw) * d + Math.cos(yaw) * shoulder,
      Math.min(3.05, 1.45 + Math.sin(pitch) * d * 0.5 + Math.max(0, 2.0 - d) * 0.9),
      p.z - Math.cos(yaw) * d - Math.sin(yaw) * shoulder,
    );
    if (!this.initialized) {
      this.position.copy(desired);
      this.initialized = true;
    } else this.position.lerp(this.position, desired, 1 - Math.exp(-16 * dt));
    if (
      !walkable({ x: this.position.x, z: this.position.z }, 0.16, false) ||
      !lineClear(p, { x: this.position.x, z: this.position.z }, 0.08)
    )
      this.position.copy(desired);
    // Orbit interpolation may cross the player's centre. Move above the head instead of through it.
    const horizontal = Math.hypot(this.position.x - p.x, this.position.z - p.z);
    if (horizontal < 0.95) this.position.y = Math.max(this.position.y, 2.85);
    this.hideNico = horizontal < 0.55 && this.position.y < 2.45;
    this.avatarOpacity = Math.max(0.12, Math.min(1, (horizontal - 0.45) / 0.9));
    if (this.entity.camera) this.entity.camera.fov = 65 + Math.max(0, 1.3 - horizontal) * 24;
    this.entity.setPosition(this.position);
    this.entity.lookAt(target);
  }
}
