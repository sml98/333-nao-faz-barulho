import { config, type Point } from './config';
import { move, layout } from './level';
import type { Input } from './input';
export class Player {
  position: Point = { x: layout.spawns.nico[0], z: layout.spawns.nico[2] };
  heading = 0;
  moving = false;
  tick(dt: number, input: Input, hidden: boolean) {
    const m = input.movement();
    this.moving = m.moving && !hidden;
    if (!this.moving) return false;
    const speed = input.quiet ? config.shush : input.running ? config.run : config.walk;
    const next = move(this.position, m.x * speed * dt, m.z * speed * dt);
    const collided =
      Math.hypot(next.x - this.position.x, next.z - this.position.z) < speed * dt * 0.4;
    this.position = next;
    this.heading = Math.atan2(m.x, m.z);
    return collided;
  }
}
