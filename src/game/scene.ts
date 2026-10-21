import { AppBase, Color, Entity, StandardMaterial, Texture } from 'playcanvas';
import { boundaries, layout, inside } from './level';
export const palette = {
  navy: '#183449',
  mustard: '#dba437',
  skin: '#e6ac7b',
  khaki: '#a68d62',
  gold: '#c79b58',
  wood: '#493025',
  wine: '#691e2b',
  teal: '#24505a',
  ivory: '#e9d6b7',
};
export class Art {
  app: AppBase;
  materials = new Map<string, StandardMaterial>();
  constructor(app: AppBase) {
    this.app = app;
  }
  material(hex: string, glow = false) {
    const id = hex + glow;
    let m = this.materials.get(id);
    if (!m) {
      m = new StandardMaterial();
      m.diffuse = new Color().fromString(hex);
      m.gloss = glow ? 40 : 22;
      m.metalness = 0;
      if (glow) {
        m.emissive = new Color().fromString(hex);
        m.emissiveIntensity = 1.4;
      }
      m.update();
      this.materials.set(id, m);
    }
    return m;
  }
  part(
    parent: Entity,
    name: string,
    type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'plane',
    p: number[],
    s: number[],
    color: string,
    glow = false,
  ) {
    const e = new Entity(name);
    e.addComponent('render', {
      type,
      material: this.material(color, glow),
      castShadows: false,
      receiveShadows: true,
    });
    e.setLocalPosition(p[0], p[1], p[2]);
    e.setLocalScale(s[0], s[1], s[2]);
    parent.addChild(e);
    return e;
  }
  text(parent: Entity, text: string, p: number[], width = 1, height = 0.35, north = false) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#152c32';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#c79b58';
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, 502, 118);
    ctx.fillStyle = '#f4dbad';
    ctx.font = '600 56px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 66, 490);
    const t = new Texture(this.app.graphicsDevice, { width: 512, height: 128, mipmaps: true });
    t.flipY = false;
    t.setSource(c);
    const m = new StandardMaterial();
    m.diffuseMap = t;
    m.emissiveMap = t;
    m.emissive = new Color(0.65, 0.65, 0.65);
    m.update();
    const e = this.part(parent, 'placa ' + text, 'plane', p, [width, 1, height], palette.gold);
    e.setLocalEulerAngles(90, north ? 0 : 180, 0);
    e.render!.material = m;
    return e;
  }
  hotel() {
    const root = new Entity('Hotel Bellmare — geometria canônica');
    this.app.root.addChild(root);
    // Nonoverlapping floor strips avoid z-fighting at intersections.
    for (let z = -15; z < 7.5; z += 0.5) {
      let from: number | null = null;
      for (let x = -16; x <= 16; x += 0.5) {
        const on =
          x < 16 &&
          layout.zones.some(
            (r) =>
              x + 0.25 >= r.x_min &&
              x + 0.25 <= r.x_max &&
              z + 0.25 >= r.z_min &&
              z + 0.25 <= r.z_max,
          );
        if (on && from === null) from = x;
        if (!on && from !== null) {
          this.part(
            root,
            'piso',
            'box',
            [(from + x) / 2, -0.1, z + 0.25],
            [x - from, 0.2, 0.5],
            z > 4 ? palette.wine : z < -9 ? palette.wood : palette.teal,
          );
          this.part(
            root,
            'teto',
            'box',
            [(from + x) / 2, 3.45, z + 0.25],
            [x - from, 0.1, 0.5],
            '#302a27',
          );
          from = null;
        }
      }
    }
    // Merge collinear half-metre boundary segments into long walls.
    const groups = new Map<string, ReturnType<typeof boundaries>>();
    for (const b of boundaries()) {
      const k = `${b.horizontal}:${b.horizontal ? b.z : b.x}`;
      const list = groups.get(k) ?? [];
      list.push(b);
      groups.set(k, list);
    }
    for (const list of groups.values()) {
      list.sort((a, b) => (a.horizontal ? a.x - b.x : a.z - b.z));
      let i = 0;
      while (i < list.length) {
        let j = i;
        while (
          j + 1 < list.length &&
          Math.abs(
            (list[j + 1].horizontal ? list[j + 1].x - list[j].x : list[j + 1].z - list[j].z) - 0.5,
          ) < 0.01
        )
          j++;
        const a = list[i],
          b = list[j],
          length = (j - i + 1) * 0.5,
          cx = (a.x + b.x) / 2,
          cz = (a.z + b.z) / 2;
        this.part(
          root,
          'parede',
          'box',
          [cx, 1.7, cz],
          [a.horizontal ? length : 0.16, 3.4, a.horizontal ? 0.16 : length],
          palette.wood,
        );
        for (const [y, h, color] of [
          [0.14, 0.12, palette.gold],
          [0.95, 0.045, palette.gold],
          [3.12, 0.14, palette.gold],
          [1.95, 1.9, '#23383d'],
        ] as const)
          this.part(
            root,
            'friso',
            'box',
            [cx, y, cz],
            [a.horizontal ? length : 0.18, h, a.horizontal ? 0.18 : length],
            color,
          );
        // Textured inset panels face into the union; narrow real pilasters retain depth.
        const inward = a.horizontal
          ? inside({ x: cx, z: cz + 0.3 })
            ? 1
            : -1
          : inside({ x: cx + 0.3, z: cz })
            ? 1
            : -1;
        for (let k = 0; k < length; k += 2) {
          const width = Math.min(2, length - k),
            pc = cx - (a.horizontal ? length / 2 : 0) + (a.horizontal ? k + width / 2 : 0),
            pz = cz - (!a.horizontal ? length / 2 : 0) + (!a.horizontal ? k + width / 2 : 0);
          const panel = this.part(
            root,
            'painel de parede',
            'plane',
            [
              pc + (a.horizontal ? 0 : inward * 0.105),
              1.58,
              pz + (a.horizontal ? inward * 0.105 : 0),
            ],
            [width - 0.04, 1, 3.02],
            palette.teal,
          );
          panel.setLocalEulerAngles(
            90,
            a.horizontal ? (inward > 0 ? 0 : 180) : inward > 0 ? 90 : -90,
            0,
          );
          const px = a.horizontal ? pc - width / 2 : pc,
            qz = a.horizontal ? pz : pz - width / 2;
          this.part(
            root,
            'pilastra',
            'box',
            [px, 1.55, qz],
            [a.horizontal ? 0.065 : 0.23, 3.1, a.horizontal ? 0.23 : 0.065],
            palette.gold,
          );
        }
        i = j + 1;
      }
    }
    // Rich carpet tiles sit just over the nonoverlapping collision floor.
    for (const z of [6, -6])
      for (let x = -15; x < 16; x += 2)
        this.part(
          root,
          'carpete',
          'plane',
          [x, 0.014, z],
          [2, 1, z > 0 ? 2.42 : 1.82],
          palette.wine,
        );
    for (const x of [-14.75, 14.75])
      for (let z = -4; z < 5; z += 2)
        this.part(root, 'carpete', 'plane', [x, 0.016, z], [1.84, 1, 2], palette.wine);
    for (let z = -13; z < -7; z += 2)
      this.part(root, 'carpete', 'plane', [0, 0.017, z], [z < -9 ? 2.6 : 1.8, 1, 2], palette.wine);
    // Runner with gold piping establishes the long axes.
    for (const z of [6, -6])
      for (const x of [-0.94, 0.94])
        this.part(
          root,
          'borda de carpete',
          'box',
          [0, 0.008, z + x],
          [31.8, 0.015, 0.035],
          palette.gold,
        );
    for (const x of [-14.75, 14.75])
      for (const d of [-0.77, 0.77])
        this.part(
          root,
          'borda lateral',
          'box',
          [x + d, 0.01, 0.1],
          [0.025, 0.02, 14.4],
          palette.gold,
        );
    for (const d of layout.doors) {
      const elevator = d.id === 'elevador',
        sign = elevator ? 1 : -1,
        z = d.z + sign * 0.02;
      this.part(root, 'moldura ' + d.id, 'box', [d.x, 1.45, z], [2.03, 2.9, 0.18], palette.gold);
      this.part(
        root,
        'porta ' + d.id,
        'box',
        [d.x, 1.4, z + sign * 0.1],
        [1.78, 2.8, 0.045],
        elevator ? '#725537' : '#522c29',
      );

      this.text(
        root,
        elevator ? 'ELEVADOR' : d.id,
        [d.x, 2.5, z + sign * 0.16],
        1.1,
        0.3,
        elevator,
      );
      this.part(
        root,
        'maçaneta',
        'sphere',
        [d.x + 0.58, 1.15, z + sign * 0.18],
        [0.1, 0.1, 0.1],
        palette.gold,
      );
    }
    this.text(root, '3:33', [0, 3.03, -14.6], 1.35, 0.33, true);
    this.text(root, 'SILÊNCIO', [-6.5, 2.25, 7.37], 1.7, 0.4);
    this.text(root, '301  ←   QUARTOS   →  303', [0, 2.65, -4.86], 2.6, 0.37);
    for (const z of [-7.1, 7.35])
      for (let x = -12; x <= 12; x += 4) {
        const south = z < 0;
        this.part(root, 'suporte arandela', 'box', [x, 2.25, z], [0.25, 0.55, 0.18], palette.gold);
        this.part(
          root,
          'luz âmbar',
          'sphere',
          [x, 2.35, z + (south ? 0.18 : -0.18)],
          [0.22, 0.42, 0.22],
          '#ffc578',
          true,
        );
        this.part(
          root,
          'aura estilizada',
          'cone',
          [x, 2.32, z + (south ? 0.18 : -0.18)],
          [0.5, 0.6, 0.45],
          palette.ivory,
        );
      }
    for (const h of layout.hiding_spots) {
      const r = new Entity(h.id);
      r.setPosition(h.x, 0, h.z);
      root.addChild(r);
      this.part(
        r,
        'esconderijo',
        'box',
        [-0.72, 1.0, 0],
        [0.38, 2, 0.9],
        h.id.includes('alcova') ? '#5e2338' : '#26424a',
      );
      this.part(r, 'acabamento', 'box', [-0.72, 2.05, 0], [0.48, 0.08, 1], palette.gold);
      this.text(r, 'ESCONDER', [-0.72, 1.65, 0.48], 0.8, 0.2, true);
    }
    for (const o of layout.obstacles) {
      this.part(
        root,
        o.id,
        'box',
        [o.x, 0.4, o.z],
        [0.68, 0.8, 0.68],
        o.id === 'planta' ? '#736543' : palette.wood,
      );
      if (o.id === 'planta')
        for (let n = 0; n < 5; n++) {
          const leaf = this.part(
            root,
            'folhagem',
            'sphere',
            [o.x + Math.sin(n) * 0.17, 1.1 + n * 0.07, o.z + Math.cos(n) * 0.17],
            [0.24, 0.65, 0.22],
            '#427259',
          );
          leaf.setEulerAngles(n * 15, 0, n * 25);
        }
      else
        this.part(
          root,
          'objeto ruidoso',
          'sphere',
          [o.x, 0.95, o.z],
          [0.4, 0.27, 0.35],
          palette.gold,
        );
    }
    return root;
  }
}
export interface Actor {
  root: Entity;
  body: Entity;
  legs: Entity[];
  arms: Entity[];
  head: Entity;
  box: Entity;
  lid: Entity;
  mouth: Entity;
  eyes: Entity[];
  glb?: boolean;
  mouthBase?: number[];
  eyesBase?: number[][];
}
export function animate(
  a: Actor,
  time: number,
  moving: boolean,
  shush: boolean,
  agitation: number,
  monster = false,
) {
  const gait = moving ? Math.sin(time * (monster ? 6 : 10)) : 0;
  for (let i = 0; i < 2; i++) {
    a.legs[i].setLocalEulerAngles(gait * 25 * (i ? 1 : -1), 0, 0);
    a.arms[i].setLocalEulerAngles(
      monster ? gait * 20 * (i ? 1 : -1) : shush && i === 1 ? -45 : a.glb ? 0 : -35,
      0,
      0,
    );
  }
  a.eyes.forEach((eye, i) => {
    const base = a.eyesBase?.[i];
    if (base) eye.setLocalScale(base[0], base[1] * (1 + agitation * 0.002), base[2]);
  });
  a.body.setLocalPosition(0, moving ? Math.abs(gait) * 0.035 : Math.sin(time * 2) * 0.01, 0);
  a.head.setLocalEulerAngles(shush ? 8 : 0, Math.sin(time) * 4, 0);
  a.box.setLocalEulerAngles(
    Math.sin(time * 20) * agitation * 0.04,
    0,
    Math.cos(time * 17) * agitation * 0.04,
  );
  a.lid.setLocalEulerAngles(agitation > 60 ? Math.sin(time * 15) * 12 : 0, 0, 0);
  a.mouth.setLocalScale(
    a.mouthBase?.[0] ?? 0.12,
    a.mouthBase ? a.mouthBase[1] * (1 + agitation * 0.03) : 0.04 + agitation * 0.0014,
    a.mouthBase?.[2] ?? 0.025,
  );
}
