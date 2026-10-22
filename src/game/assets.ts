import { Asset, AppBase, Entity, StandardMaterial } from 'playcanvas';
import type { ContainerResource } from 'playcanvas';
import type { Actor } from './scene';
import { attachAnimation } from './characterAnimation';
export interface GameAssets {
  models: Record<string, Asset>;
}
function load(app: AppBase, name: string, type: string, url: string): Promise<Asset> {
  return new Promise((resolve, reject) => {
    const a = new Asset(name, type, { url });
    a.ready(() => resolve(a));
    a.on('error', (e: unknown) => reject(new Error(String(e))));
    app.assets.add(a);
    app.assets.load(a);
  });
}
export async function loadAssets(app: AppBase): Promise<GameAssets> {
  const ids = [
    'nico',
    'porteiro',
    'caixa_nervosa',
    'pacote_arrogante',
    'caixa_paranoica',
    'sideTableDrawers',
    'lampRoundTable',
    'plantSmall1',
    'hotelFloorTile',
    'hotelFloorPatch',
    'hotelWallPanel',
    'hotelDoor',
    'hotelSconce',
    'hotelWardrobe',
    'hotelBeacon',
    'hotelTelephone',
    'hotelParcelStack',
  ];
  const characters = new Set([
    'nico',
    'porteiro',
    'caixa_nervosa',
    'pacote_arrogante',
    'caixa_paranoica',
  ]);
  const loaded = await Promise.all(
    ids.map((id) =>
      load(
        app,
        id,
        'container',
        `${import.meta.env.BASE_URL}assets/${characters.has(id) ? 'characters' : 'environment'}/${id}.glb`,
      ),
    ),
  );
  const models = Object.fromEntries(ids.map((id, i) => [id, loaded[i]]));
  return { models };
}
export function instantiate(assets: GameAssets, id: string) {
  return (assets.models[id].resource as ContainerResource).instantiateRenderEntity({
    castShadows: true,
    receiveShadows: true,
  });
}
export function makeActor(app: AppBase, assets: GameAssets, monster = false): Actor {
  const root = new Entity(monster ? 'Porteiro' : 'Nico'),
    yaw = new Entity('calibrated yaw'),
    visual = instantiate(assets, monster ? 'porteiro' : 'nico');
  root.addChild(yaw);
  yaw.addChild(visual);
  app.root.addChild(root);
  const scale = monster ? 2.7 / 2.7937 : 1.78 / 1.984;
  visual.setLocalScale(scale, scale, scale);
  visual.setLocalPosition(0, 0, 0);
  const get = (name: string) => {
    const e = visual.findByName(name) as Entity | null;
    if (!e) throw new Error('Nó GLB ausente: ' + name);
    return e;
  };
  const body = get(monster ? 'PorteiroRig' : 'NicoRig'),
    head = get('head'),
    legs = [get('upperleg.l'), get('lowerleg.l')],
    arms = [get('upperarm.l'), get('upperarm.r')];
  const rig = attachAnimation(visual, assets.models[monster ? 'porteiro' : 'nico']);
  const fadeMaterials: StandardMaterial[] = [];
  if (!monster) {
    const clones = new Map<StandardMaterial, StandardMaterial>();
    for (const c of head.findComponents('render'))
      for (const mi of (c as import('playcanvas').RenderComponent).meshInstances) {
        const original = mi.material as StandardMaterial;
        let clone = clones.get(original);
        if (!clone) {
          clone = original.clone();
          clones.set(original, clone);
          fadeMaterials.push(clone);
        }
        mi.material = clone;
      }
  }
  const box = new Entity('Living parcels');
  if (!monster)
    ['caixa_nervosa', 'pacote_arrogante', 'caixa_paranoica'].forEach((id, i) => {
      const child = instantiate(assets, id);
      child.name = `Parcel${i}`;
      child.enabled = i === 0;
      box.addChild(child);
    });
  if (monster) body.addChild(box);
  else get('PackageSocket').addChild(box);
  return {
    root,
    body,
    head,
    legs,
    arms,
    box,
    glb: true,
    rig,
    fadeMaterials,
  };
}
