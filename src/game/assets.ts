import { Asset, AppBase, Entity, Texture, StandardMaterial, Color, Vec2 } from 'playcanvas';
import type { ContainerResource } from 'playcanvas';
import type { Actor } from './scene';
export interface GameAssets {
  models: Record<string, Asset>;
  atlas: Texture;
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
  const [nico, porteiro, box, atlas] = await Promise.all([
    load(app, 'Nico', 'container', '/assets/models/nico.glb'),
    load(app, 'Porteiro', 'container', '/assets/models/porteiro.glb'),
    load(app, 'Caixa', 'container', '/assets/models/box.glb'),
    load(app, 'Bellmare atlas', 'texture', '/assets/textures/bellmare-atlas.png'),
  ]);
  const texture = atlas.resource as Texture;
  texture.anisotropy = 4;
  return { models: { nico, porteiro, box }, atlas: texture };
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
  const scale = monster ? 2.7 / 2.67 : 1.78 / 1.785;
  visual.setLocalScale(scale, scale, scale);
  visual.setLocalPosition(
    0,
    monster ? -0.005 * scale : -0.007 * scale,
    monster ? -0.1425 * scale : 0.0059 * scale,
  );
  const get = (name: string) => {
    const e = visual.findByName(name) as Entity | null;
    if (!e) throw new Error('Nó GLB ausente: ' + name);
    return e;
  };
  const body = get('corpo animável'),
    head = get('cabeça'),
    legs = [get('perna0'), get('perna1')],
    arms = [get('braço0'), get('braço1')];
  const box = instantiate(assets, 'box');
  box.setLocalPosition(0, 1, 0.44);
  body.addChild(box);
  const lid = box.findByName('tampa') as Entity,
    mouth = box.findByName('boca animável') as Entity;
  const eyes = ['eye white', 'eye white.001']
    .map((name) => box.findByName(name) as Entity)
    .filter(Boolean);
  const eyesBase = eyes.map((e) => {
    const s = e.getLocalScale();
    return [s.x, s.y, s.z];
  });
  const ms = mouth.getLocalScale();
  return {
    root,
    body,
    head,
    legs,
    arms,
    box,
    lid,
    mouth,
    eyes,
    eyesBase,
    glb: true,
    mouthBase: [ms.x, ms.y, ms.z],
  };
}
// Atlas generated from the supplied hotel references; the horizontal split is at y=580/1254.
export function atlasMaterial(atlas: Texture, kind: 'wall' | 'carpet' | 'door' | 'wood') {
  const m = new StandardMaterial();
  m.diffuseMap = atlas;
  m.diffuse = new Color(1, 1, 1);
  m.gloss = kind === 'carpet' ? 2 : 12;
  const top = 580 / 1254,
    margin = 0.003;
  const bounds =
    kind === 'wall'
      ? [0, 1 - top, 0.5, top]
      : kind === 'carpet'
        ? [0.5, 1 - top, 0.5, top]
        : kind === 'door'
          ? [0, 0, 0.5, 1 - top]
          : [0.5, 0, 0.5, 1 - top];
  m.diffuseMapTiling = new Vec2(bounds[2] - margin * 2, bounds[3] - margin * 2);
  m.diffuseMapOffset = new Vec2(bounds[0] + margin, bounds[1] + margin);
  m.update();
  return m;
}
