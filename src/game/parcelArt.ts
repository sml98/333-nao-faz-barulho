import type { Entity, RenderComponent } from 'playcanvas';
import type { Art } from './scene';
export class ParcelSkin {
  current = -1;
  box: Entity;
  constructor(_art: Art, box: Entity) {
    this.box = box;
  }
  set(index: number) {
    if (index === this.current) return;
    this.current = index;
    if (this.box.name === 'Encomenda no elevador')
      this.box.setLocalPosition(0.85, 0.745 + [0.48, 0.59, 0.42][index] / 2, -12);
    for (let i = 0; i < 3; i++) this.box.findByName(`Parcel${i}`)!.enabled = i === index;
  }
}
export function animateParcel(box: Entity, time: number, agitation: number) {
  const current = box.children.find((c) => c.enabled) as Entity | undefined;
  if (!current) return;
  const index = Number(current.name.slice(-1));
  const strength = agitation / 100;
  box.setLocalEulerAngles(
    Math.sin(time * (index === 2 ? 27 : 20)) * strength * 4,
    0,
    Math.cos(time * 17) * strength * 3,
  );
  const lid = current.findByName('tampa') as Entity;
  lid?.setLocalEulerAngles(agitation > 60 ? Math.max(0, Math.sin(time * 15)) * 12 : 0, 0, 0);
  const blink = Math.max(0, 1 - Math.abs(((time + index * 0.7) % 3.8) - 3.5) / 0.09);
  for (const c of current.findComponents('render'))
    for (const mi of (c as RenderComponent).meshInstances) {
      const morph = mi.morphInstance;
      if (!morph) continue;
      for (const target of morph.morph.targets) {
        if (target.name === 'Blink') morph.setWeight('Blink', blink);
        else if (target.name === 'Panic') morph.setWeight('Panic', strength);
        else if (target.name === 'Look')
          morph.setWeight('Look', index === 2 ? (1 + Math.sin(time * 6)) * 0.5 : 0.2);
      }
    }
}
