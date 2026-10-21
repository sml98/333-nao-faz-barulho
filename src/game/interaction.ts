import type { Point } from './config';
import { distance } from './config';
import { layout } from './level';
import type { GameState } from './gameState';
export type Interaction = {
  kind: 'pickup' | 'deliver' | 'elevator' | 'hide' | 'exit_hide';
  id: string;
  label: string;
};
export function interaction(g: GameState, p: Point): Interaction | null {
  if (g.hidden) return { kind: 'exit_hide', id: g.hidden, label: 'Sair do esconderijo' };
  if (distance(p, { x: 0, z: -12 }) < 1.8 && !g.held && g.delivered < g.total)
    return { kind: 'pickup', id: 'caixa', label: `Pegar encomenda • ${301 + g.delivered}` };
  if (g.held) {
    const d = layout.doors[g.delivered];
    if (distance(p, { x: d.x, z: d.z - 0.55 }) < 1.65)
      return { kind: 'deliver', id: d.id, label: `Entregar no ${d.id}` };
  }
  if (g.delivered === g.total && distance(p, { x: 0, z: -13.5 }) < 1.85)
    return { kind: 'elevator', id: 'elevador', label: 'Entrar no elevador' };
  const h = layout.hiding_spots.find((h) => distance(p, h) < 1.25);
  if (h) return { kind: 'hide', id: h.id, label: 'Esconder-se' };
  return null;
}
