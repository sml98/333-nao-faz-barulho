import { Entity } from 'playcanvas';
import { Art, palette } from './scene';
export class ParcelSkin {
  box: Entity;
  art: Art;
  glasses: Entity;
  bow: Entity;
  labels: Entity[];
  current = -1;
  constructor(art: Art, box: Entity) {
    this.art = art;
    this.box = box;
    this.glasses = new Entity('óculos escuros PREMIUM');
    box.addChild(this.glasses);
    for (const x of [-0.13, 0.13])
      art.part(this.glasses, 'lente', 'sphere', [x, 0.045, 0.26], [0.2, 0.15, 0.07], '#16212a');
    art.part(this.glasses, 'ponte', 'box', [0, 0.045, 0.26], [0.12, 0.035, 0.04], palette.gold);
    this.bow = new Entity('laço rosa');
    box.addChild(this.bow);
    for (const x of [-0.09, 0.09])
      art.part(this.bow, 'orelha', 'sphere', [x, 0.31, 0], [0.16, 0.14, 0.09], '#c57891');
    this.labels = ['FRÁGIL', 'PREMIUM', 'NÃO ABRA'].map((t) =>
      art.text(box, t, [0, -0.17, 0.229], 0.4, 0.09, true),
    );
  }
  set(index: number) {
    if (index === this.current) return;
    this.current = index;
    const colors = ['#b9844d', '#1d2632', '#9f816b'];
    const m = this.art.material(colors[index]);
    for (const name of ['papelão', 'fold front', 'lid left', 'lid right']) {
      const body = this.box.findByName(name) as Entity | null;
      if (body?.render) body.render.material = m;
    }
    this.glasses.enabled = index === 1;
    this.bow.enabled = index === 2;
    this.labels.forEach((l, i) => (l.enabled = i === index));
    this.box.setLocalScale(index === 1 ? 0.93 : 1, index === 1 ? 1.15 : 1, 1);
  }
}
