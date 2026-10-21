import {
  AppBase,
  AppOptions,
  BatchManager,
  CameraComponentSystem,
  ContainerHandler,
  FILLMODE_FILL_WINDOW,
  LightComponentSystem,
  RESOLUTION_AUTO,
  RenderComponentSystem,
  TextureHandler,
  createGraphicsDevice,
} from 'playcanvas';
import './style.css';
import { runGame } from './game/runtime';
import { loadAssets } from './game/assets';
const canvas = document.querySelector<HTMLCanvasElement>('canvas')!;
try {
  const device = await createGraphicsDevice(canvas, { deviceTypes: ['webgl2'], antialias: false });
  device.maxPixelRatio = Math.min(devicePixelRatio, 1.5);
  const options = new AppOptions();
  options.graphicsDevice = device;
  options.batchManager = BatchManager;
  options.componentSystems = [RenderComponentSystem, CameraComponentSystem, LightComponentSystem];
  options.resourceHandlers = [TextureHandler, ContainerHandler];
  const app = new AppBase(canvas);
  app.init(options);
  app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(RESOLUTION_AUTO);
  window.addEventListener('resize', () => app.resizeCanvas());
  document.querySelector('#ui')!.textContent = 'Preparando o Hotel Bellmare…';
  const assets = await loadAssets(app);
  runGame(app, canvas, assets);
  app.start();
} catch (error) {
  document.querySelector('#ui')!.textContent =
    'Não foi possível abrir o jogo (WebGL2 ou carregamento de assets): ' + String(error);
  throw error;
}
