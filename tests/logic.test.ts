import { describe, it, expect } from 'vitest';
import { GameState } from '../src/game/gameState';
import { newPackage, tickPackage } from '../src/game/packages';
import { chooseNoise, type NoiseEvent } from '../src/game/sound';
import { walkable, route, lineClear, layout, move } from '../src/game/level';
import { canSee } from '../src/game/perception';
import { Porteiro } from '../src/game/porteiro';
const noise = (id = 1): NoiseEvent => ({
  id,
  position: { x: -6, y: 0.65, z: 6 },
  loudness: 1,
  radius: 15,
  sourceId: 'test',
  timestamp: 0,
  ttl: 2,
});
describe('contratos de jogo', () => {
  it('entrega única, ordem certa e retorno obrigatório', () => {
    const g = new GameState();
    g.reset();
    expect(g.deliver('301')).toBe(false);
    g.pickup();
    expect(g.deliver('302')).toBe(false);
    expect(g.deliver('301')).toBe(true);
    expect(g.deliver('301')).toBe(false);
    expect(g.phase).toBe('PLAYING');
    expect(g.finish()).toBe(true);
    g.reset();
    expect(g.held).toBe(false);
    expect(g.delivered).toBe(0);
    expect(g.phase).toBe('PLAYING');
  });
  it('suporta três entregas sem duplicação', () => {
    const g = new GameState();
    g.reset(3);
    for (const id of ['301', '302', '303']) {
      expect(g.finish()).toBe(false);
      expect(g.pickup()).toBe(true);
      expect(g.deliver(id)).toBe(true);
      expect(g.deliver(id)).toBe(false);
    }
    expect(g.finish()).toBe(true);
  });
  it('limita agitação em 10000 atualizações', () => {
    const p = newPackage();
    for (let i = 0; i < 10000; i++) {
      tickPackage(p, 0.016, i % 3 !== 0, i % 7 < 4, i % 11 < 3);
      expect(p.agitation).toBeGreaterThanOrEqual(0);
      expect(p.agitation).toBeLessThanOrEqual(100);
    }
  });
  it('avisa antes do grito e respeita cooldown', () => {
    const p = newPackage();
    p.agitation = 59;
    expect(tickPackage(p, 0.1, true, true, false).warning).toBe(true);
    p.agitation = 85;
    expect(tickPackage(p, 1, true, false, false).scream).toBe(false);
    expect(tickPackage(p, 0.51, true, false, false).scream).toBe(true);
    p.agitation = 100;
    expect(tickPackage(p, 2, true, true, false).scream).toBe(false);
    const before = p.agitation;
    tickPackage(p, 0.5, true, false, true);
    expect(p.agitation).toBeLessThan(before);
  });
});
it('personalidades têm agitação de corrida diferente', () => {
  const a = newPackage(1),
    b = newPackage(2);
  tickPackage(a, 1, true, true, false);
  tickPackage(b, 1, true, true, false);
  expect(b.agitation).toBeGreaterThan(a.agitation);
});
describe('geometria, percepção e IA', () => {
  it('mantém joins livres e evita paredes e obstáculos', () => {
    for (const p of [
      { x: 0, z: -9 },
      { x: 0, z: -6 },
      { x: -14.75, z: 6 },
      { x: 14.75, z: -6 },
    ])
      expect(walkable(p)).toBe(true);
    expect(walkable({ x: 0, z: 0 })).toBe(false);
    expect(walkable({ x: -4, z: 5.9 })).toBe(false);
    expect(move({ x: 0, z: -12 }, 4, 0)).toEqual({ x: 0, z: -12 });
  });
  it('todas as portas e esconderijos são acessíveis por navgrid', () => {
    const from = { x: 0, z: -12 };
    for (const p of [
      ...layout.doors.slice(0, 3).map((d) => ({ x: d.x, z: 6.5 })),
      ...layout.hiding_spots,
    ]) {
      const path = route(from, p);
      expect(path.length).toBeGreaterThan(1);
      let last = from;
      for (const point of path) {
        expect(lineClear(last, point, 0.24)).toBe(true);
        last = point;
      }
    }
  });
  it('oclusão e esconderijo impedem visão', () => {
    expect(canSee({ x: 0, z: -6 }, 0, { x: 0, z: 6 }, false)).toBe(false);
    expect(canSee({ x: 0, z: 6 }, Math.PI / 2, { x: 3, z: 6 }, false)).toBe(true);
    expect(canSee({ x: 0, z: 6 }, Math.PI / 2, { x: 3, z: 6 }, true)).toBe(false);
    expect(canSee({ x: 0, z: 6 }, Math.PI / 2, { x: -3, z: 6 }, false)).toBe(false);
  });
  it('ruído expira e é posição independente', () => {
    const e = noise();
    expect(chooseNoise([e], { x: -7, z: 6 }, 1)).toBe(e);
    expect(chooseNoise([e], { x: -7, z: 6 }, 3)).toBeUndefined();
    expect(chooseNoise([e], { x: 15, z: -6 }, 1)).toBeUndefined();
  });
  it('investiga origem ouvida e retorna após busca sem seguir alvo oculto', () => {
    const ai = new Porteiro();
    const e = noise();
    ai.tick(0.1, { x: 0, z: -12 }, false, [e], 0.1);
    expect(ai.state).toBe('LISTEN');
    expect(ai.target).toEqual(e.position);
    ai.tick(0.8, { x: 10, z: -6 }, false, [], 0.9);
    expect(ai.state).toBe('INVESTIGATE');
    expect(ai.target).toEqual(e.position);
    for (let i = 0; i < 100; i++) ai.tick(0.1, { x: 0, z: -12 }, true, [], 1 + i * 0.1);
    expect(['RETURN', 'PATROL']).toContain(ai.state);
    expect(walkable(ai.position, 0.27)).toBe(true);
  });
  it('perde visão, busca e não captura sem confirmação', () => {
    const ai = new Porteiro();
    ai.heading = Math.PI / 2;
    ai.tick(0.1, { x: -5, z: 6 }, false, [], 0);
    expect(ai.state).toBe('CHASE');
    for (let i = 0; i < 15; i++) ai.tick(0.1, { x: 0, z: -12 }, false, [], i * 0.1);
    expect(ai.state).toBe('SEARCH');
  });
});

it('ruídos contínuos não reiniciam indefinidamente a escuta', () => {
  const ai = new Porteiro();
  const initial = { ...ai.position };
  for (let i = 0; i < 20; i++) {
    const e = { ...noise(i + 1), position: { x: -4.8, y: 0.65, z: 6.9 }, timestamp: i * 0.1 };
    ai.tick(0.1, { x: 0, z: -12 }, false, [e], i * 0.1);
  }
  expect(ai.state).not.toBe('LISTEN');
  expect(ai.position.x).toBeGreaterThan(initial.x + 0.4);
});
it('ruído junto ao obstáculo usa ponto alcançável e termina investigação', () => {
  const ai = new Porteiro();
  const e = { ...noise(), position: { x: -4.59, y: 0.65, z: 5.9 } };
  ai.tick(0.1, { x: 0, z: -12 }, false, [e], 0);
  for (let i = 0; i < 180; i++) ai.tick(0.1, { x: 0, z: -12 }, false, [], 0.1 + i * 0.1);
  expect(['PATROL', 'RETURN']).toContain(ai.state);
});
