import { test, expect } from '@playwright/test';
import { snap, go } from './helpers';
test.use({ deviceScaleFactor: 0.5 });

test('Marco 1: teclado conclui uma entrega, pausa, SHHH, câmera e reinício', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByTestId('mode').selectOption('1');
  await page.locator('#quality').selectOption('low');
  await page.getByTestId('start').click();
  await expect.poll(async () => (await snap(page)).time).toBeGreaterThan(0.1);
  await page.keyboard.press('e');
  await expect.poll(async () => (await snap(page)).held).toBe(true);
  await page.keyboard.down('Shift');
  await page.keyboard.down('w');
  await expect
    .poll(async () => (await snap(page)).agitation, { timeout: 15000 })
    .toBeGreaterThan(20);
  await page.keyboard.up('Shift');
  await page.keyboard.up('w');
  await page.keyboard.down('Space');
  const before = (await snap(page)).agitation;
  await expect.poll(async () => (await snap(page)).agitation).toBeLessThan(before - 3);
  await page.keyboard.up('Space');
  await page.keyboard.press('Escape');
  await expect(page.locator('#ui')).toHaveAttribute('data-phase', 'PAUSED');
  const paused = (await snap(page)).time;
  await page.waitForTimeout(400);
  expect((await snap(page)).time).toBe(paused);
  await page.getByTestId('start').click();
  await go(page, 0, -6);
  await go(page, -14.7, -6);
  await go(page, -14.7, 0);
  await page.keyboard.press('e');
  await expect.poll(async () => (await snap(page)).hidden).toBe('armario_oeste');
  await page.keyboard.press('e');
  await expect.poll(async () => (await snap(page)).hidden).toBeNull();
  await go(page, -14.7, 6);
  await go(page, -10.5, 6);
  await page.keyboard.press('e');
  await expect.poll(async () => (await snap(page)).delivered).toBe(1);
  await page.keyboard.press('e');
  expect((await snap(page)).delivered).toBe(1);
  await page.screenshot({ path: 'evidence/marco1-entrega.png' });
  await go(page, -14.7, 6);
  await go(page, -14.7, -6);
  await go(page, 0, -6);
  await go(page, 0, -12);
  await page.keyboard.press('e');
  await expect(page.locator('#ui')).toHaveAttribute('data-phase', 'WON');
  await page.screenshot({ path: 'evidence/marco1-vitoria.png' });
  await page.getByTestId('start').click();
  await expect.poll(async () => (await snap(page)).delivered).toBe(0);
  expect(errors).toEqual([]);
});
test('toque emulado permite joystick + SHHH sem girar câmera', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.getByTestId('mode').selectOption('1');
  await page.locator('#quality').selectOption('low');
  await page.getByTestId('start').tap();
  await expect.poll(async () => (await snap(page)).time).toBeGreaterThan(0.1);
  const session = await context.newCDPSession(page),
    j = (await page.getByTestId('joystick').boundingBox())!,
    b = (await page.getByTestId('shush').boundingBox())!,
    center = { x: j.x + j.width / 2, y: j.y + j.height / 2 },
    shush = { x: b.x + b.width / 2, y: b.y + b.height / 2, id: 2 };
  const rightStart = await snap(page),
    stickRight = { ...center, id: 1 };
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [stickRight] });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ ...stickRight, x: center.x + 34 }],
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ ...stickRight, x: center.x + 34 }, shush],
  });
  await expect.poll(async () => (await snap(page)).input.quiet).toBe(true);
  await expect
    .poll(async () => (await snap(page)).player.x)
    .toBeLessThan(rightStart.player.x - 0.15);
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(async () => (await snap(page)).input.quiet).toBe(false);
  await page.getByTestId('interact').tap();
  await expect.poll(async () => (await snap(page)).held).toBe(true);
  const stick = { x: center.x, y: center.y - 35, id: 1 };
  const initial = await snap(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [stick] });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [stick, shush],
  });
  await expect.poll(async () => (await snap(page)).input.quiet).toBe(true);
  await expect
    .poll(async () => (await snap(page)).player.z)
    .toBeGreaterThan(initial.player.z + 0.15);
  expect((await snap(page)).input.yaw).toBe(initial.input.yaw);
  await page.screenshot({ path: 'evidence/marco1-touch.png' });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(async () => (await snap(page)).input.quiet).toBe(false);
  await context.close();
});
