import type { Page } from '@playwright/test';
export type Snapshot = {
  phase: string;
  player: { x: number; z: number };
  time: number;
  delivered: number;
  held: boolean;
  agitation: number;
  hidden: string | null;
  porteiro: { position: { x: number; z: number }; state: string };
  input: { quiet: boolean; stick: { x: number; y: number }; yaw: number };
  cameraBasis: { right: { x: number; z: number }; forward: { x: number; z: number } };
};
export const snap = (page: Page) =>
  page.evaluate(() => (window as unknown as { snapshot: () => Snapshot }).snapshot());
export async function go(page: Page, x: number, z: number, runWhenEmpty = false) {
  console.log('Indo para', x, z);
  // SwiftShader may render only 1–3 frames/s; allow the game simulation time
  // to cover long in-map routes without weakening the reached-position check.
  for (let n = 0; n < 480; n++) {
    const s = await snap(page);
    if (s.phase !== 'PLAYING') throw new Error('Partida terminou: ' + JSON.stringify(s));
    const dx = x - s.player.x,
      dz = z - s.player.z,
      cameraRight = dx * s.cameraBasis.right.x + dz * s.cameraBasis.right.z,
      cameraForward = dx * s.cameraBasis.forward.x + dz * s.cameraBasis.forward.z;
    if (Math.hypot(dx, dz) < 0.28) {
      for (const k of ['w', 'a', 's', 'd']) await page.keyboard.up(k);
      console.log('Alcançado', x, z, s.time);
      return;
    }
    if (runWhenEmpty && !s.held) await page.keyboard.down('Shift');
    else await page.keyboard.up('Shift');
    const want = new Set<string>();
    // A small camera yaw/shoulder offset can require a subtle lateral input
    // to pass narrow joins in the canonical map. Keep correcting until close.
    if (Math.abs(cameraRight) > 0.05) want.add(cameraRight > 0 ? 'd' : 'a');
    if (Math.abs(cameraForward) > 0.05) want.add(cameraForward > 0 ? 'w' : 's');
    for (const k of ['w', 'a', 's', 'd'])
      if (want.has(k)) await page.keyboard.down(k);
      else await page.keyboard.up(k);
    await page.waitForTimeout(160);
  }
  throw new Error('Não alcançou alvo ' + x + ',' + z + ' ' + JSON.stringify(await snap(page)));
}

/** Move with ordinary, camera-relative controls until the live guard can see Nico. */
export async function approachPorteiro(page: Page, allowCapture = false) {
  const movement = ['w', 'a', 's', 'd'];
  for (let n = 0; n < 480; n++) {
    const s = await snap(page);
    if (s.phase !== 'PLAYING') {
      if (allowCapture && s.phase === 'LOST') return;
      throw new Error('Partida terminou: ' + JSON.stringify(s));
    }
    if (s.porteiro.state === 'CHASE' && !allowCapture) {
      for (const key of movement) await page.keyboard.up(key);
      return;
    }
    const dx = s.porteiro.position.x - s.player.x;
    const dz = s.porteiro.position.z - s.player.z;
    // For capture, keep closing to the real capture radius so an intervening
    // sight break cannot leave the AI searching while the test waits in place.
    const captureDistance = allowCapture ? 0.5 : 1.05;
    if (Math.hypot(dx, dz) < captureDistance) {
      for (const key of movement) await page.keyboard.up(key);
    } else {
      const right = dx * s.cameraBasis.right.x + dz * s.cameraBasis.right.z;
      const forward = dx * s.cameraBasis.forward.x + dz * s.cameraBasis.forward.z;
      const want = new Set<string>();
      if (Math.abs(right) > 0.05) want.add(right > 0 ? 'd' : 'a');
      if (Math.abs(forward) > 0.05) want.add(forward > 0 ? 'w' : 's');
      for (const key of movement)
        if (want.has(key)) await page.keyboard.down(key);
        else await page.keyboard.up(key);
    }
    await page.waitForTimeout(160);
  }
  throw new Error('Não alcançou o Porteiro ' + JSON.stringify(await snap(page)));
}
