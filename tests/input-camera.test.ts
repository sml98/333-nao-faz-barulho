import { describe, expect, it } from 'vitest';
import { Entity, Vec3 } from 'playcanvas';
import { FollowCamera, type PlanarCameraBasis } from '../src/game/camera';
import { Input } from '../src/game/input';
import { Player } from '../src/game/player';

type Direction = {
  name: string;
  stick: { x: number; y: number };
  keys: string[];
  right: number;
  forward: number;
};

const diagonally = Math.SQRT1_2;
const directions: Direction[] = [
  { name: 'cima', stick: { x: 0, y: -1 }, keys: ['KeyW'], right: 0, forward: 1 },
  { name: 'baixo', stick: { x: 0, y: 1 }, keys: ['KeyS'], right: 0, forward: -1 },
  { name: 'direita', stick: { x: 1, y: 0 }, keys: ['KeyD'], right: 1, forward: 0 },
  { name: 'esquerda', stick: { x: -1, y: 0 }, keys: ['KeyA'], right: -1, forward: 0 },
  {
    name: 'diagonal cima-direita',
    stick: { x: diagonally, y: -diagonally },
    keys: ['KeyW', 'KeyD'],
    right: diagonally,
    forward: diagonally,
  },
  {
    name: 'diagonal cima-esquerda',
    stick: { x: -diagonally, y: -diagonally },
    keys: ['KeyW', 'KeyA'],
    right: -diagonally,
    forward: diagonally,
  },
  {
    name: 'diagonal baixo-direita',
    stick: { x: diagonally, y: diagonally },
    keys: ['KeyS', 'KeyD'],
    right: diagonally,
    forward: -diagonally,
  },
  {
    name: 'diagonal baixo-esquerda',
    stick: { x: -diagonally, y: diagonally },
    keys: ['KeyS', 'KeyA'],
    right: -diagonally,
    forward: -diagonally,
  },
];

function inputFor(stick: Direction['stick'], keys: string[] = [], run = false, shush = false) {
  const input = Object.create(Input.prototype) as Input;
  input.keys = new Set(keys);
  input.stick = { ...stick };
  input.run = run;
  input.shush = shush;
  return input;
}

function cameraAt(yaw: number) {
  const camera = new FollowCamera(new Entity('camera projection test'));
  camera.tick(0, { x: 0, z: -6 }, yaw, 0.24);
  return camera;
}

function projected(camera: Entity, point: { x: number; z: number }) {
  const view = camera.getWorldTransform().clone().invert();
  const origin = view.transformPoint(new Vec3(point.x, 1, point.z));
  return (delta: { x: number; z: number }) => {
    const target = view.transformPoint(new Vec3(point.x + delta.x, 1, point.z + delta.z));
    return {
      screenX: target.x / -target.z - origin.x / -origin.z,
      forwardDepth: origin.z - target.z,
    };
  };
}

describe('direção do joystick e WASD relativa à câmera', () => {
  for (const yaw of [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]) {
    it(`move nos oito sentidos e projeta para o lado indicado a ${((yaw * 180) / Math.PI).toFixed(0)}°`, () => {
      const follow = cameraAt(yaw),
        basis: PlanarCameraBasis = follow.movementBasis(),
        screen = projected(follow.entity, { x: 0, z: -6 });

      for (const direction of directions) {
        const player = new Player();
        player.position = { x: 0, z: -6 };
        const input = inputFor(direction.stick);
        player.tick(0.1, input, false, basis);
        const delta = {
          x: player.position.x,
          z: player.position.z + 6,
        };
        expect(Math.hypot(delta.x, delta.z), direction.name).toBeGreaterThan(0.2);
        expect(delta.x * basis.right.x + delta.z * basis.right.z, direction.name).toBeCloseTo(
          direction.right * 0.25,
          2,
        );
        expect(delta.x * basis.forward.x + delta.z * basis.forward.z, direction.name).toBeCloseTo(
          direction.forward * 0.25,
          2,
        );

        // Camera-space perspective projection: right changes screen X; forward
        // changes camera depth. These checks catch a mirrored view mapping.
        const pixelDirection = screen(delta);
        if (direction.right > 0) expect(pixelDirection.screenX, direction.name).toBeGreaterThan(0);
        if (direction.right < 0) expect(pixelDirection.screenX, direction.name).toBeLessThan(0);
        if (direction.right === 0)
          expect(Math.abs(pixelDirection.screenX), direction.name).toBeLessThan(1e-5);
        if (direction.forward > 0)
          expect(pixelDirection.forwardDepth, direction.name).toBeGreaterThan(0);
        if (direction.forward < 0)
          expect(pixelDirection.forwardDepth, direction.name).toBeLessThan(0);
        if (direction.forward === 0)
          expect(Math.abs(pixelDirection.forwardDepth), direction.name).toBeLessThan(1e-5);

        const keyboard = inputFor({ x: 0, y: 0 }, direction.keys);
        expect(keyboard.movement(basis), `${direction.name} teclado`).toMatchObject({
          moving: true,
          x: expect.closeTo(
            basis.right.x * direction.right + basis.forward.x * direction.forward,
            4,
          ),
          z: expect.closeTo(
            basis.right.z * direction.right + basis.forward.z * direction.forward,
            4,
          ),
        });
      }
    });
  }

  it('mantém a direção ao segurar corrida ou SHHH junto ao joystick', () => {
    const camera = cameraAt(Math.PI / 2),
      basis = camera.movementBasis(),
      stick = { x: 1, y: -1 };
    const normal = inputFor(stick).movement(basis),
      combined = inputFor(stick, [], true, true);
    expect(combined.running).toBe(true);
    expect(combined.quiet).toBe(true);
    expect(combined.movement(basis)).toEqual(normal);
  });
});
