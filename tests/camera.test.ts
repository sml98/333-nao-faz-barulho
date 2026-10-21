import { test, expect } from 'vitest';
import { Entity } from 'playcanvas';
import { FollowCamera } from '../src/game/camera';
import { walkable } from '../src/game/level';
test('câmera orbital evita paredes e o volume da cabeça nos corredores canônicos', () => {
  const camera = new FollowCamera(new Entity('camera test'));
  for (const p of [
    { x: 0, z: -12 },
    { x: 0, z: -6 },
    { x: -14.7, z: -6 },
    { x: -14.7, z: 5.1 },
    { x: 0, z: 6.8 },
    { x: 14.7, z: -6.8 },
  ]) {
    expect(walkable(p)).toBe(true);
    for (let angle = 0; angle < Math.PI * 4; angle += 0.11) {
      camera.tick(0.016, p, angle, 0.17);
      const v = camera.position;
      expect(camera.avatarOpacity).toBeGreaterThanOrEqual(0.12);
      expect(camera.avatarOpacity).toBeLessThanOrEqual(1);
      if (Math.hypot(v.x - p.x, v.z - p.z) < 1) expect(camera.avatarOpacity).toBeLessThan(1);
      expect(walkable({ x: v.x, z: v.z }, 0.05, false)).toBe(true);
      expect(Math.hypot(v.x - p.x, v.z - p.z) > 0.55 || v.y > 2.45 || camera.hideNico).toBe(true);
    }
  }
});
