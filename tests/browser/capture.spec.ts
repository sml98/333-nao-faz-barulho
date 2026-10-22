import { test, expect } from '@playwright/test';
import { snap, go, approachPorteiro } from './helpers';
test.use({ deviceScaleFactor: 0.5 });

test('captura real, reinício e giro por mouse', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByTestId('mode').selectOption('1');
  await page.locator('#quality').selectOption('low');
  await page.getByTestId('start').click();
  await expect.poll(async () => (await snap(page)).time).toBeGreaterThan(0.1);
  await page.mouse.move(320, 180);
  await page.mouse.down();
  await page.mouse.move(380, 180, { steps: 4 });
  await page.mouse.up();
  await expect.poll(async () => (await snap(page)).input.yaw).toBeLessThan(-0.2);
  await page.mouse.down();
  await page.mouse.move(320, 180, { steps: 4 });
  await page.mouse.up();
  await expect.poll(async () => Math.abs((await snap(page)).input.yaw)).toBeLessThan(0.01);
  await page.keyboard.press('e');
  await go(page, 0, -6);
  await go(page, -14.7, -6);
  await go(page, -14.7, 6);
  await go(page, -14.7, 5.1);
  await go(page, 0, 5.1);
  // Make a real noisy approach until the normal AI enters CHASE. Read-only
  // snapshots steer ordinary camera-relative inputs; the test never teleports
  // an actor or changes the game state.
  await page.keyboard.down('Shift');
  await approachPorteiro(page, true);
  await page.keyboard.up('Shift');
  expect((await snap(page)).porteiro.state).toBe('CHASE');
  // Stay put and let the unmodified AI finish its normal capture warning.
  await expect
    .poll(async () => (await snap(page)).phase, { timeout: 100000, intervals: [500] })
    .toBe('LOST');
  await page.screenshot({ path: 'evidence/marco1-captura.png' });
  await page.getByTestId('start').click();
  await expect.poll(async () => (await snap(page)).phase).toBe('PLAYING');
  expect((await snap(page)).delivered).toBe(0);
  expect((await snap(page)).held).toBe(false);
  expect(errors).toEqual([]);
});
