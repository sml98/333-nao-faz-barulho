import { Asset, AppBase, Entity, Texture, StandardMaterial, Color, Vec2 } from 'playcanvas';
import type { ContainerResource } from 'playcanvas';
import type { Actor } from './scene';
import { attachAnimation } from './characterAnimation';
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
  const ids = [
    'nico',
    'porteiro',
    'caixa_nervosa',
    'pacote_arrogante',
    'caixa_paranoica',
    'sideTableDrawers',
    'lampRoundTable',
    'plantSmall1',
  ];
  const loaded = await Promise.all(
    ids.map((id) =>
      load(
        app,
        id,
        'container',
        `${import.meta.env.BASE_URL}assets/${ids.indexOf(id) < 5 ? 'characters' : 'environment'}/${id}.glb`,
      ),
    ),
  );
  const models = Object.fromEntries(ids.map((id, i) => [id, loaded[i]]));
  const atlas = await load(
    app,
    'Bellmare atlas',
    'texture',
    `${import.meta.env.BASE_URL}assets/textures/bellmare-atlas.png`,
  );
  const texture = atlas.resource as Texture;
  texture.anisotropy = 4;
  return { models, atlas: texture };
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
  if (kind === 'wall') {
    // Preserve gold pixels, shift teal panels to the reference's purple in the material.
    // This is a shader on the existing 3D walls, not a background image.
    m.shaderChunksVersion = '2.23';
    m.getShaderChunks().set(
      'diffusePS',
      `
      uniform vec3 material_diffuse;
      void getAlbedo() {
        dAlbedo=material_diffuse;
        #ifdef STD_DIFFUSE_TEXTURE
          vec3 tex={STD_DIFFUSE_TEXTURE_DECODE}(texture2DBias({STD_DIFFUSE_TEXTURE_NAME}, {STD_DIFFUSE_TEXTURE_UV}, {STD_TEXTURE_BIAS})).{STD_DIFFUSE_TEXTURE_CHANNEL};
          float teal=smoothstep(0.003,0.025,min(tex.g-tex.r,tex.b-tex.r));
          float luminance=dot(tex,vec3(0.2126,0.7152,0.0722));
          dAlbedo*=mix(tex,vec3(0.46,0.10,0.68)*max(0.12,luminance*3.5),teal);
        #endif
      }
    `,
    );
  }
  m.update();
  return m;
}
