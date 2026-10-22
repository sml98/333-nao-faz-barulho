import { test, expect } from '@playwright/test';
import { snap, go, approachPorteiro } from './helpers';
test('slice: caixa viva e perseguição com corrida esquelética do Porteiro', async ({ page }) => {
  test.setTimeout(420000);
  await page.setViewportSize({ width: 480, height: 270 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  await page.getByTestId('mode').selectOption('1');
  await page.locator('#quality').selectOption('low');
  await page.getByTestId('start').click();
  await expect.poll(async () => (await snap(page)).time).toBeGreaterThan(0.1);
  await page.keyboard.press('e');
  await expect.poll(async () => (await snap(page)).held).toBe(true);
  await go(page, 0, -6);
  await go(page, -14.7, -6);
  await go(page, -14.7, 5.1);
  // Make real footsteps/parcel noise; the unmodified AI investigates and sees the player.
  await page.keyboard.down('Shift');
  await approachPorteiro(page);
  await expect
    .poll(async () => (await snap(page)).porteiro.state, { timeout: 90000, intervals: [150] })
    .toBe('CHASE');
  const before: any = await page.evaluate(() => (window as any).snapshot());
  const heading = before.player.x > before.porteiro.position.x ? Math.PI / 2 : -Math.PI / 2;
  const yaw = (heading === Math.PI / 2 ? -Math.PI / 2 : Math.PI / 2) + 0.65;
  await page.setViewportSize({ width: 1000, height: 562 });
  const delta = -yaw / 0.005;
  const startX = delta < 0 ? 980 : 20;
  await page.mouse.move(startX, 260);
  await page.mouse.down();
  await page.mouse.move(startX + delta, 260, { steps: 3 });
  await page.mouse.up();
  await page.keyboard.down('s');
  await expect
    .poll(
      async () => (await page.evaluate(() => (window as any).snapshot())).monsterAnimation.state,
    )
    .toBe('Chase');
  const a: any = await page.evaluate(() => (window as any).snapshot());
  await expect
    .poll(
      async () => {
        const b: any = await page.evaluate(() => (window as any).snapshot());
        return (
          Math.abs(b.monsterAnimation.left - a.monsterAnimation.left) +
          Math.abs(b.monsterAnimation.right - a.monsterAnimation.right)
        );
      },
      { timeout: 15000 },
    )
    .toBeGreaterThan(10);
  await page.screenshot({ path: 'evidence/art-chase.png' });
  const final: any = await page.evaluate(() => (window as any).snapshot());
  await page.screenshot({ path: 'evidence/art-chase-next.png' });
  await page.keyboard.up('s');
  await page.keyboard.up('Shift');
  expect(final.held).toBe(true);
  expect(final.phase).toBe('PLAYING');
  expect(final.porteiro.state).toBe('CHASE');
  expect(errors).toEqual([]);
  console.log('CHASE EVIDENCE', JSON.stringify({ before, a, final }));
});
