import { animateParcel } from './parcelArt';
import type { RigAnimation } from './characterAnimation';
import { AppBase, Color, Entity, StandardMaterial, Texture } from 'playcanvas';
import { boundaries, layout, inside } from './level';
export const palette = {
  navy: '#24556b',
  mustard: '#f5bd62',
  skin: '#e6ac7b',
  khaki: '#d6bd94',
  gold: '#f3bd67',
  wood: '#54b9ad',
  wine: '#ed8190',
  teal: '#8eb9c4',
  ivory: '#fff1d4',
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
  text(
    parent: Entity,
    text: string,
    p: number[],
    width = 1,
    height = 0.35,
    north = false,
    facingY?: number,
  ) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#fff1d4';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#ed8190';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.roundRect(5, 5, 502, 118, 22);
    ctx.stroke();
    ctx.fillStyle = '#24556b';
    ctx.font = '700 56px system-ui, sans-serif';
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
    e.setLocalEulerAngles(90, facingY ?? (north ? 0 : 180), 0);
    e.render!.material = m;
    return e;
  }
  hotel(createModule: (id: string) => Entity) {
    const root = new Entity('Hotel Bellmare — geometria canônica');
    this.app.root.addChild(root);
    const module = (
      id: string,
      name: string,
      position: [number, number, number],
      yaw = 0,
      scale: [number, number, number] = [1, 1, 1],
      parent = root,
    ) => {
      const entity = createModule(id);
      entity.name = name;
      entity.setLocalPosition(...position);
      entity.setLocalEulerAngles(0, yaw, 0);
      entity.setLocalScale(...scale);
      parent.addChild(entity);
      return entity;
    };
    // Round stone GLBs replace box floor visuals; half-metre cell membership is
    // still sampled from the unchanged walkable-zone source.
    const floorCells: Array<[number, number]> = [];
    const floorKeys = new Set<string>();
    const cellKey = (x: number, z: number) => `${x.toFixed(1)},${z.toFixed(1)}`;
    for (let z = -15; z < 7.5; z += 0.5)
      for (let x = -16; x < 16; x += 0.5) {
        const center = { x: x + 0.25, z: z + 0.25 };
        if (
          layout.zones.some(
            (r) =>
              center.x >= r.x_min &&
              center.x <= r.x_max &&
              center.z >= r.z_min &&
              center.z <= r.z_max,
          )
        ) {
          floorCells.push([x, z]);
          floorKeys.add(cellKey(x, z));
        }
      }
    const placedFloorCells = new Set<string>();
    for (const [x, z] of floorCells) {
      const key = cellKey(x, z);
      if (placedFloorCells.has(key)) continue;
      const patchCells: Array<[number, number]> = [
        [x, z],
        [x + 0.5, z],
        [x, z + 0.5],
        [x + 0.5, z + 0.5],
      ];
      const fullPatch =
        Number.isInteger(x) &&
        Number.isInteger(z) &&
        patchCells.every(
          ([cx, cz]) => floorKeys.has(cellKey(cx, cz)) && !placedFloorCells.has(cellKey(cx, cz)),
        );
      const tileRotation = (Math.round((x + z) * 2) & 3) * 90;
      if (fullPatch) {
        module(
          'hotelFloorPatch',
          'pavimento de pedra arredondada',
          [x + 0.5, 0, z + 0.5],
          tileRotation,
        );
        patchCells.forEach(([cx, cz]) => placedFloorCells.add(cellKey(cx, cz)));
      } else {
        module(
          'hotelFloorTile',
          'pavimento de pedra arredondada',
          [x + 0.25, 0, z + 0.25],
          tileRotation,
        );
        placedFloorCells.add(key);
      }
    }
    // Ceiling stays as a light shell; merge continuous runs to limit draw work.
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
            'teto',
            'box',
            [(from + x) / 2, 3.45, z + 0.25],
            [x - from, 0.1, 0.5],
            '#f4e4c8',
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
          '#f0d9b6',
        );
        // Rounded Blender panels supply the depth; the wall union and all routes
        // still come from the canonical layout and its unchanged collision code.
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
            pz = cz - (!a.horizontal ? length / 2 : 0) + (!a.horizontal ? k + width / 2 : 0),
            sameDoorWall = layout.doors.some(
              (d) =>
                Math.abs(d[a.horizontal ? 'z' : 'x'] - (a.horizontal ? cz : cx)) < 0.2 &&
                Math.abs(d[a.horizontal ? 'x' : 'z'] - (a.horizontal ? pc : pz)) < width / 2 + 1.08,
            );
          if (sameDoorWall) continue;
          module(
            'hotelWallPanel',
            'módulo de parede arredondado',
            [
              pc + (a.horizontal ? 0 : inward * 0.16),
              1.58,
              pz + (a.horizontal ? inward * 0.16 : 0),
            ],
            a.horizontal ? (inward > 0 ? 0 : 180) : inward > 0 ? 90 : -90,
            [width / 2, 1, 1],
          );
        }
        i = j + 1;
      }
    }
    // Rich carpet tiles sit just over the nonoverlapping collision floor.
    for (const z of [6, -6])
      for (let x = -15; x < 16; x += 2)
        this.part(root, 'carpete', 'plane', [x, 0.014, z], [2, 1, z > 0 ? 2.42 : 1.82], '#ed8190');
    for (const x of [-14.75, 14.75])
      for (let z = -4; z < 5; z += 2)
        this.part(root, 'carpete', 'plane', [x, 0.016, z], [1.84, 1, 2], '#ed8190');
    for (let z = -13; z < -7; z += 2)
      this.part(root, 'carpete', 'plane', [0, 0.017, z], [z < -9 ? 2.6 : 1.8, 1, 2], '#ed8190');
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
      module('hotelDoor', 'porta art déco ' + d.id, [d.x, 1.45, z], elevator ? 0 : 180);

      this.text(
        root,
        elevator ? 'ELEVADOR' : d.id,
        [d.x, 2.5, z + sign * 0.34],
        1.1,
        0.3,
        elevator,
      );
    }
    this.text(root, '3:33', [0, 3.03, -14.6], 1.35, 0.33, true);
    this.text(root, 'SILÊNCIO', [-6.5, 2.25, 7.37], 1.7, 0.4);
    this.text(root, '301  ←   QUARTOS   →  303', [0, 2.65, -4.86], 2.6, 0.37);
    for (const z of [-7.1, 7.35])
      for (let x = -12; x <= 12; x += 4) {
        const south = z < 0;
        // Do not hang a wall fixture across the open hall/corridor junction.
        if (inside({ x, z: south ? -7.5 : 7.7 })) continue;
        module(
          'hotelSconce',
          'arandela art déco',
          [x, 2.25, z + (south ? 0.06 : -0.06)],
          south ? 0 : 180,
          [1, 1, 0.55],
        );
      }
    for (const h of layout.hiding_spots) {
      const r = new Entity(h.id);
      r.setPosition(h.x, 0, h.z);
      root.addChild(r);
      const facing = h.x < 0 ? 90 : -90,
        frontOffset = h.x < 0 ? 0.5 : -0.5;
      module(
        'hotelWardrobe',
        'armário Kenney remodelado',
        [-0.72, 0, 0],
        facing,
        [0.7, 1, 0.65],
        r,
      );
      this.text(r, 'ESCONDER', [-0.72 + frontOffset, 1.65, 0], 0.8, 0.2, false, facing);
    }
    // Canonical obstacle colliders/noise remain in level.ts; their visual meshes
    // are furnished with the normalized Kenney assets by runtime.ts.

    return root;
  }
}
export interface Actor {
  rig?: RigAnimation;
  fadeMaterials?: StandardMaterial[];
  root: Entity;
  body: Entity;
  legs: Entity[];
  arms: Entity[];
  head: Entity;
  box: Entity;
  glb?: boolean;
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
  if (!a.rig)
    for (let i = 0; i < 2; i++) {
      a.legs[i].setLocalEulerAngles(gait * 25 * (i ? 1 : -1), 0, 0);
      a.arms[i].setLocalEulerAngles(
        monster ? gait * 20 * (i ? 1 : -1) : shush && i === 1 ? -45 : a.glb ? 0 : -35,
        0,
        0,
      );
    }
  if (!a.rig)
    a.body.setLocalPosition(0, moving ? Math.abs(gait) * 0.035 : Math.sin(time * 2) * 0.01, 0);
  if (!a.rig) a.head.setLocalEulerAngles(shush ? 8 : 0, Math.sin(time) * 4, 0);
  animateParcel(a.box, time, agitation);
}
