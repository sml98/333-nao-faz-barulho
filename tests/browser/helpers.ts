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
};
export const snap = (page: Page) =>
  page.evaluate(() => (window as unknown as { snapshot: () => Snapshot }).snapshot());
export async function go(page: Page, x: number, z: number) {
  console.log('Indo para', x, z);
  for (let n = 0; n < 240; n++) {
    const s = await snap(page);
    if (s.phase !== 'PLAYING') throw new Error('Partida terminou: ' + JSON.stringify(s));
    const dx = x - s.player.x,
      dz = z - s.player.z;
    if (Math.hypot(dx, dz) < 0.28) {
      for (const k of ['w', 'a', 's', 'd']) await page.keyboard.up(k);
      console.log('Alcançado', x, z, s.time);
      return;
    }
    if (!s.held) await page.keyboard.down('Shift');
    else await page.keyboard.up('Shift');
    const want = new Set<string>();
    if (Math.abs(dx) > 0.18) want.add(dx > 0 ? 'd' : 'a');
    if (Math.abs(dz) > 0.18) want.add(dz > 0 ? 'w' : 's');
    for (const k of ['w', 'a', 's', 'd'])
      if (want.has(k)) await page.keyboard.down(k);
      else await page.keyboard.up(k);
    await page.waitForTimeout(160);
  }
  throw new Error('Não alcançou alvo ' + x + ',' + z + ' ' + JSON.stringify(await snap(page)));
}
