import { AppBase, Color, Entity, TONEMAP_NEUTRAL } from 'playcanvas';
import { Art, animate } from './scene';
import { Player } from './player';
import { Input } from './input';
import {animateRig} from './characterAnimation';
import { FollowCamera } from './camera';
import { GameState } from './gameState';
import { Porteiro } from './porteiro';
import { AudioBus, type NoiseEvent } from './sound';
import { tickPackage, personalities } from './packages';
import { ParcelSkin } from './parcelArt';
import { makeActor, atlasMaterial, type GameAssets } from './assets';
import { interaction } from './interaction';
import { UI } from './ui';
import { distance } from './config';
import { layout } from './level';
export function runGame(app: AppBase, canvas: HTMLCanvasElement, assets: GameAssets) {
  const ui = new UI(),
    input = new Input(canvas),
    audio = new AudioBus(),
    art = new Art(app);
  const hotel = art.hotel();
  const wallMat = atlasMaterial(assets.atlas, 'wall'),
    carpetMat = atlasMaterial(assets.atlas, 'carpet'),
    woodMat = atlasMaterial(assets.atlas, 'wood'),
    doorMat = atlasMaterial(assets.atlas, 'door');
  for (const c of hotel.findComponents('render')) {
    const r = c as import('playcanvas').RenderComponent;
    const name = r.entity.name;
    if (name === 'painel de parede') r.material = wallMat;
    else if (name === 'carpete') r.material = carpetMat;
    else if (name === 'parede' || name === 'teto') r.material = woodMat;
    else if (name.startsWith('porta ')) r.material = doorMat;
  }
  if (!(import.meta.env.DEV && new URLSearchParams(location.search).get('batch') === '0')) {
    const group = app.batcher.addGroup('Hotel estático', false, 12);
    for (const component of hotel.findComponents('render'))
      (component as import('playcanvas').RenderComponent).batchGroupId = group.id;
  }

  const nico = makeActor(app, assets),
    monster = makeActor(app, assets, true);
  monster.box.enabled = false;
  const skin = new ParcelSkin(art, nico.box);
  const supply = nico.box.clone();
  supply.name = 'Encomenda no elevador';
  supply.setLocalPosition(0.85, 0.95, -12);
  app.root.addChild(supply);
  // Supply needs its own original decorations; remove the cloned skin accessories first.
  for (const name of [
    'óculos escuros PREMIUM',
    'laço rosa',
    'placa FRÁGIL',
    'placa PREMIUM',
    'placa NÃO ABRA',
  ])
    supply.findByName(name)?.destroy();
  const supplySkin = new ParcelSkin(art, supply);
  skin.set(0);
  supplySkin.set(0);
  const actorGroup = app.batcher.addGroup('Personagens articulados', true, 4);
  for (const root of [nico.root, monster.root, supply])
    for (const component of root.findComponents('render'))
      if(!(component as import('playcanvas').RenderComponent).meshInstances.some(m=>m.skinInstance||m.morphInstance))(component as import('playcanvas').RenderComponent).batchGroupId = actorGroup.id;
  let lastSkin = 0;

  art.part(app.root, 'mesa de encomendas', 'box', [0.85, 0.37, -12], [0.85, 0.74, 0.65], '#493025');

  const camera = new Entity('Câmera terceira pessoa');
  camera.addComponent('camera', {
    fov: 65,
    toneMapping: TONEMAP_NEUTRAL,
    nearClip: 0.055,
    farClip: 70,
    clearColor: new Color(0.04, 0.095, 0.12),
  });
  app.root.addChild(camera);
  const follow = new FollowCamera(camera);
  app.scene.ambientLight = new Color(0.3, 0.34, 0.39);
  app.scene.fog.type = 'linear';
  app.scene.fog.color = new Color(0.05, 0.12, 0.15);
  app.scene.fog.start = 14;
  app.scene.fog.end = 38;
  const light = new Entity('Luz principal');
  light.addComponent('light', {
    type: 'directional',
    color: new Color(1, 0.84, 0.68),
    intensity: 0.95,
    castShadows: true,
    shadowResolution: 1024,
    shadowDistance: 25,
    shadowBias: 0.15,
    normalOffsetBias: 0.04,
  });
  light.setEulerAngles(48, 28, 0);
  app.root.addChild(light);
  const fill = new Entity('Preenchimento frio');
  fill.addComponent('light', {
    type: 'directional',
    color: new Color(0.3, 0.65, 0.83),
    intensity: 0.35,
  });
  fill.setEulerAngles(25, 210, 0);
  app.root.addChild(fill);
  for (const [x, z, warm] of [
    [0, -12, 1],
    [-11, 6, 1],
    [-1, 6, 1],
    [10, 6, 1],
    [-10, -6, 0],
    [8, -6, 0],
  ]) {
    const lamp = new Entity('Luz ambiente local');
    lamp.addComponent('light', {
      type: 'omni',
      color: new Color(warm ? 1 : 0.35, warm ? 0.79 : 0.66, warm ? 0.5 : 0.87),
      intensity: 0.85,
      range: 5.2,
      castShadows: false,
    });
    lamp.setPosition(x, 2.6, z);
    app.root.addChild(lamp);
  }
  const actorFill = new Entity('Luz de leitura dos personagens');
  actorFill.addComponent('light', {
    type: 'omni',
    color: new Color(0.8, 0.85, 1),
    intensity: 0.65,
    range: 4,
    castShadows: false,
  });
  app.root.addChild(actorFill);
  if (matchMedia('(pointer:coarse)').matches) {
    document.querySelector<HTMLSelectElement>('#quality')!.value = 'low';
    light.light!.castShadows = false;
    app.graphicsDevice.maxPixelRatio = 1;
    app.resizeCanvas();
  }
  const goal = art.part(
    app.root,
    'Destino da entrega',
    'cone',
    [0, 2, -12],
    [0.17, 0.26, 0.17],
    '#e5bb72',
    true,
  );
  goal.setEulerAngles(180, 0, 0);
  const g = new GameState();
  let player = new Player(),
    ai = new Porteiro(),
    events: NoiseEvent[] = [],
    noiseId = 0,
    stepClock = 0,
    bumpCooldown = 0,
    captionUntil = 0,
    noiseUntil = 0,
    lastAI = ai.state,
    frames = 0,
    frameTime = performance.now(),
    fps = 0,
    lastJoke = -20;
  const useCaption = () => document.querySelector<HTMLInputElement>('#subtitles')!.checked;
  const caption = (text: string) => {
    if (useCaption()) {
      ui.text('caption', text);
      captionUntil = g.time + 3.2;
    }
  };
  const emit = (sourceId: string, loudness: number, radius: number) => {
    events.push({
      id: ++noiseId,
      sourceId,
      position: { ...player.position, y: 0.65 },
      loudness,
      radius,
      timestamp: g.time,
      ttl: 2,
    });
    noiseUntil = g.time + 0.65;
    ui.text(
      'noise',
      sourceId === 'grito'
        ? '◌ A CAIXA GRITOU!'
        : sourceId === 'colisão'
          ? '◌ OBJETO CHACOALHOU'
          : loudness > 0.3
            ? '◌ Passos de corrida'
            : '· passos leves',
    );
    audio.tone(
      sourceId === 'grito' ? 780 : sourceId === 'colisão' ? 260 : 110,
      0.12,
      loudness * 0.045,
    );
  };
  const start = () => {
    input.clear();
    player = new Player();
    ai = new Porteiro();
    g.reset(Number(document.querySelector<HTMLSelectElement>('#mode')!.value));
    ai.difficulty =
      document.querySelector<HTMLSelectElement>('#difficulty')!.value === 'easy'
        ? 'easy'
        : 'normal';
    events = [];
    noiseId = 0;
    stepClock = 0;
    bumpCooldown = 0;
    captionUntil = 0;
    noiseUntil = 0;
    lastJoke = -20;
    lastAI = ai.state;
    follow.initialized = false;
    input.yaw = 0;
    input.pitch = 0.24;
    audio.unlock();
    ui.text('caption', '');
    ui.text('noise', '');
    caption('Pegue a Caixa Nervosa. O quarto 301 fica no corredor norte, a oeste.');
  };
  document.querySelector('#start')!.addEventListener('click', () => {
    if (g.phase === 'PAUSED') {
      g.phase = 'PLAYING';
      input.clear();
      audio.unlock();
    } else start();
  });
  document.querySelector('#restart')!.addEventListener('click', start);
  document
    .querySelector('#audio')!
    .addEventListener('change', (e) => (audio.enabled = (e.target as HTMLInputElement).checked));
  document.querySelector('#quality')!.addEventListener('change', (e) => {
    app.graphicsDevice.maxPixelRatio =
      (e.target as HTMLSelectElement).value === 'low' ? 1 : Math.min(devicePixelRatio, 1.5);
    app.resizeCanvas();
    light.light!.castShadows = (e.target as HTMLSelectElement).value !== 'low';
  });
  window.addEventListener('resize', () => {
    if (
      innerHeight > innerWidth &&
      matchMedia('(pointer:coarse)').matches &&
      g.phase === 'PLAYING'
    ) {
      g.phase = 'PAUSED';
      input.clear();
      ui.menu(g.phase);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && g.phase === 'PLAYING') {
      g.phase = 'PAUSED';
      input.clear();
      ui.menu(g.phase);
    }
  });
  ui.menu('MENU');
  app.on('update', (dt: number) => {
    frames++;
    const now = performance.now();
    if (now - frameTime >= 1000) {
      fps = Math.round((frames * 1000) / (now - frameTime));
      frames = 0;
      frameTime = now;
    }
    if (input.pause) {
      input.pause = false;
      if (g.phase === 'PLAYING') {
        g.phase = 'PAUSED';
        input.clear();
        ui.menu(g.phase);
      } else if (g.phase === 'PAUSED') {
        g.phase = 'PLAYING';
        input.clear();
      }
    }
    if (g.phase === 'PLAYING') {
      g.time += dt;
      bumpCooldown -= dt;
      events = events.filter((e) => g.time - e.timestamp <= e.ttl);
      const collided = player.tick(dt, input, !!g.hidden);
      if (
        collided &&
        bumpCooldown <= 0 &&
        layout.obstacles.some((o) => distance(o, player.position) < 1 && o.noise_if_hit)
      ) {
        emit('colisão', 0.75, 12);
        bumpCooldown = 2;
      }
      if (player.moving) {
        stepClock += dt;
        if (stepClock > (input.running && !input.quiet ? 0.32 : 0.64)) {
          stepClock = 0;
          emit(
            'passos',
            input.running && !input.quiet ? 0.65 : 0.12,
            input.running && !input.quiet ? 8 : 1.7,
          );
        }
      }
      if (g.held) {
        const result = tickPackage(
          g.box,
          dt,
          player.moving,
          player.moving && input.running,
          input.quiet,
        );
        if (result.warning) {
          caption(`${personalities[g.delivered].name}: “${personalities[g.delivered].warning}”`);
          audio.tone(540, 0.2);
        }
        if (result.scream) {
          caption('Caixa: “AAAAH! EU SABIA QUE IA DAR RUIM!”');
          emit('grito', 1, 17);
        }
      }
      if (input.interact) {
        input.interact = false;
        const i = interaction(g, player.position);
        if (i) {
          if (i.kind === 'pickup' && g.pickup())
            caption(`${personalities[g.delivered].name}: “${personalities[g.delivered].pickup}”`);
          else if (i.kind === 'deliver' && g.deliver(i.id)) {
            caption(
              g.delivered === g.total
                ? 'Última entrega concluída. Volte ao elevador!'
                : `Quarto ${300 + g.delivered}: “${personalities[g.delivered - 1].delivered}” Volte para buscar a próxima.`,
            );
            audio.tone(620, 0.3);
          } else if (i.kind === 'elevator') g.finish();
          else if (i.kind === 'hide') {
            g.hidden = i.id;
            caption('Escondido. SHHH reduz a agitação, mas o som ainda atravessa.');
          } else if (i.kind === 'exit_hide') g.hidden = null;
        }
      }
      if (ai.tick(dt, player.position, !!g.hidden, events, g.time)) {
        g.phase = 'LOST';
        audio.tone(78, 0.65, 0.1);
      }
      if (g.held && g.delivered === 2 && g.time - lastJoke > 18 && g.box.agitation > 30) {
        caption('Caixa Paranóica: “TEM ALGUÉM ATRÁS! …Ou era a minha fita?”');
        lastJoke = g.time;
      }
      if (ai.state !== lastAI) {
        if (import.meta.env.DEV) console.info(`[Porteiro] ${lastAI} → ${ai.state}`);
        if (ai.state === 'CHASE') {
          caption(
            g.held
              ? `${personalities[g.delivered].name}: “${personalities[g.delivered].chase}”`
              : 'Porteiro: “Silêncio… SEMPRE silêncio!”',
          );
          audio.tone(180, 0.5, 0.07);
        } else if (ai.state === 'LISTEN') audio.tone(440, 0.4);
        lastAI = ai.state;
      }
      if (g.phase !== 'PLAYING') {
        input.clear();
        ui.menu(g.phase);
      }
      if (captionUntil < g.time) ui.text('caption', '');
      if (noiseUntil < g.time) ui.text('noise', '');
    }
    const goalDoor = layout.doors[Math.min(g.delivered, 2)];
    goal.setPosition(
      g.held ? goalDoor.x : 0.85,
      g.held ? 3.05 : 1.8 + Math.sin(g.time * 3) * 0.05,
      g.held ? goalDoor.z - 0.65 : -12,
    );
    goal.enabled = g.phase === 'PLAYING' && g.delivered < g.total;
    actorFill.setPosition(
      player.position.x - Math.sin(input.yaw) * 1.2,
      2.4,
      player.position.z - Math.cos(input.yaw) * 1.2,
    );
    nico.root.setPosition(player.position.x, 0, player.position.z);
    nico.root.setEulerAngles(0, (player.heading * 180) / Math.PI, 0);
    if (lastSkin !== Math.min(2, g.delivered)) {
      lastSkin = Math.min(2, g.delivered);
      skin.set(lastSkin);
      supplySkin.set(lastSkin);
      app.batcher.markGroupDirty(actorGroup.id);
    }
    nico.box.enabled = g.held;
    supply.enabled = !g.held && g.delivered < g.total;
    nico.root.enabled = !g.hidden;
    monster.root.setPosition(ai.position.x, 0, ai.position.z);
    monster.root.setEulerAngles(0, (ai.heading * 180) / Math.PI, 0);
    if(nico.rig)animateRig(nico.rig,g.hidden?'Hide':g.held?(player.moving?(input.running&&!input.quiet?'CarryRun':'CarryWalk'):'Carry'):player.moving?(input.running&&!input.quiet?'Run':'Walk'):'Idle',g.phase!=='PLAYING',g.time,ai.state==='CHASE'?1:g.box.agitation/100);
    animate(nico, g.time, player.moving && g.phase === 'PLAYING', input.quiet, g.box.agitation);
    animate(monster, g.time, ai.state !== 'LISTEN' && g.phase === 'PLAYING', false, 0, true);
    if (ai.state === 'LISTEN') {
      const angle =
        ((Math.atan2(ai.target.x - ai.position.x, ai.target.z - ai.position.z) - ai.heading) *
          180) /
        Math.PI;
      monster.head.setLocalEulerAngles(
        7,
        Math.max(-55, Math.min(55, angle)),
        Math.sin(g.time * 8) * 4,
      );
    }
    follow.tick(dt, player.position, input.yaw, input.pitch);
    nico.root.enabled=!g.hidden&&!follow.hideNico;
    ui.update(g, interaction(g, player.position), ai.state, input.quiet);
  });
  if (import.meta.env.DEV) {
    Object.defineProperty(window, 'snapshot', {
      configurable: true,
      value: () =>
        JSON.parse(
          JSON.stringify({
            phase: g.phase,
            player: player.position,
            heading: player.heading,
            porteiro: { position: ai.position, state: ai.state, target: ai.target },
            delivered: g.delivered,
            total: g.total,
            held: g.held,
            hidden: g.hidden,
            agitation: g.box.agitation,
            lastNoise: events.at(-1) ?? null,
            time: g.time,
            fps,
            input: { quiet: input.quiet, stick: input.stick, yaw: input.yaw },
            drawCalls: app.stats.drawCallCount,
            animation: nico.rig?{state:nico.rig.state,clips:nico.rig.clips,time:nico.rig.host.anim?.baseLayer?.activeStateCurrentTime}:null,
              joints: {
              left: nico.legs[0].getLocalEulerAngles().x,
              right: nico.legs[1].getLocalEulerAngles().x,
            },
            camera: { x: follow.position.x, y: follow.position.y, z: follow.position.z },
          }),
        ),
    });
  }
}
