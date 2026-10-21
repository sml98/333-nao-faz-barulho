import { config, distance, type Point } from './config';
import { layout, move, route, reachablePoint } from './level';
import { canSee } from './perception';
import { chooseNoise, type NoiseEvent } from './sound';
export type AIState = 'PATROL' | 'LISTEN' | 'INVESTIGATE' | 'CHASE' | 'SEARCH' | 'RETURN';
export class Porteiro {
  difficulty: 'normal' | 'easy' = 'normal';
  position: Point = { x: layout.spawns.porteiro[0], z: layout.spawns.porteiro[2] };
  heading = Math.PI / 2;
  state: AIState = 'PATROL';
  target: Point = { ...this.position };
  lastSeen: Point | null = null;
  timer = 0;
  lost = 0;
  waypoint = 1;
  path: Point[] = [];
  repath = 0;
  lastNoise = 0;
  captureWarning = 0;
  change(s: AIState) {
    this.state = s;
    this.timer = 0;
    this.path = [];
    this.repath = 0;
  }
  tick(dt: number, player: Point, hidden: boolean, events: NoiseEvent[], now: number) {
    this.timer += dt;
    this.repath -= dt;
    const sees = canSee(this.position, this.heading, player, hidden);
    if (sees) {
      this.lastSeen = { ...player };
      this.lost = 0;
      if (this.state !== 'CHASE') this.change('CHASE');
      this.target = { ...player };
    } else if (this.state === 'CHASE') {
      this.lost += dt;
      if (this.lost > 1.25) {
        this.target = reachablePoint(this.lastSeen!);
        this.change('SEARCH');
      }
    }
    const noise = chooseNoise(
      events.filter((e) => e.id > this.lastNoise),
      this.position,
      now,
    );
    if (noise && this.state !== 'CHASE') {
      this.lastNoise = noise.id;
      this.target = reachablePoint(noise.position);
      if (this.state !== 'LISTEN' && this.state !== 'INVESTIGATE') this.change('LISTEN');
    }
    if (this.state === 'LISTEN' && this.timer > 0.7) this.change('INVESTIGATE');
    if (this.state === 'PATROL' || this.state === 'RETURN') {
      const p = layout.porteiro_patrol_paths.A[this.waypoint];
      this.target = reachablePoint({ x: p[0], z: p[1] });
      if (distance(this.position, this.target) < 0.45) {
        this.waypoint = (this.waypoint + 1) % layout.porteiro_patrol_paths.A.length;
        if (this.state === 'RETURN') this.change('PATROL');
      }
    }
    if (this.state === 'INVESTIGATE' && distance(this.position, this.target) < 0.4)
      this.change('SEARCH');
    if (this.state === 'SEARCH' && this.timer > 4) this.change('RETURN');
    if (this.state !== 'LISTEN') {
      if (this.repath <= 0) {
        this.path = route(this.position, this.target);
        this.repath = 0.65;
      }
      while (this.path.length && distance(this.position, this.path[0]) < 0.16) this.path.shift();
      const p = this.path[0];
      if (p) {
        const d = distance(this.position, p),
          speed = this.state === 'CHASE' ? config.chase : config.patrol;
        this.heading = Math.atan2(p.x - this.position.x, p.z - this.position.z);
        const stride = Math.min(d, speed * (this.difficulty === 'easy' ? 0.78 : 1) * dt);
        this.position = move(
          this.position,
          Math.sin(this.heading) * stride,
          Math.cos(this.heading) * stride,
          0.27,
        );
      }
    }
    // Grace period after visual confirmation; hidden actors can still be found at a loud source nearby.
    const close =
      distance(this.position, player) < config.capture &&
      (sees || (hidden && chooseNoise(events, this.position, now) !== undefined));
    this.captureWarning = close ? this.captureWarning + dt : 0;
    return this.captureWarning > 0.65;
  }
}
