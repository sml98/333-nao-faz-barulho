import { test, expect } from '@playwright/test';
test('Nico: Run esquelético, rosto frontal e câmera segura', async ({ page }) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 854, height: 480 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  await page.getByTestId('mode').selectOption('1');
  await page.locator('#quality').selectOption('low');
  await page.getByTestId('start').click();
  const snap = () => page.evaluate(() => (window as unknown as { snapshot: () => any }).snapshot());
  await expect.poll(async () => (await snap()).time, { timeout: 30000 }).toBeGreaterThan(0.3);
  await page.mouse.move(200, 190);
  await page.mouse.down();
  await page.mouse.move(828, 190, { steps: 18 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'evidence/art-nico-front.png' });
  await page.keyboard.down('Shift');
  await page.keyboard.down('s');
  await expect.poll(async () => (await snap()).animation?.state, { timeout: 20000 }).toBe('Run');
  const a = await snap();
  await page.screenshot({ path: 'evidence/art-nico-run-a.png' });
  await expect
    .poll(async () => Math.abs((await snap()).joints.left - a.joints.left), { timeout: 15000 })
    .toBeGreaterThan(8);
  const b = await snap();
  expect(Math.abs(b.joints.right - a.joints.right)).toBeGreaterThan(1);
  await page.screenshot({ path: 'evidence/art-nico-run-b.png' });
  await page.keyboard.up('s');
  await page.keyboard.up('Shift');
  expect(
    Math.hypot(b.camera.x - b.player.x, b.camera.z - b.player.z) > 0.55 || b.camera.y > 2.45,
  ).toBe(true);
  await page.keyboard.press('Escape');
  await page.getByTestId('restart').click();
  await page.keyboard.press('e');
  await expect.poll(async () => (await snap()).held).toBe(true);
  await page.mouse.move(200, 190);
  await page.mouse.down();
  await page.mouse.move(828, 190, { steps: 18 });
  await page.mouse.up();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'evidence/art-nico-carry.png' });
  // A side orbit in the narrow hall compresses the boom. Head transparency must
  // reveal the action rather than leave an opaque cap in front of the camera.
  await page.mouse.move(600, 190);
  await page.mouse.down();
  await page.mouse.move(286, 190, { steps: 6 });
  await page.mouse.up();
  const yaw = (await snap()).input.yaw;
  const positiveXKeyCandidates: Array<[string, number]> = [
    ['d', -Math.cos(yaw)],
    ['a', Math.cos(yaw)],
    ['w', Math.sin(yaw)],
    ['s', -Math.sin(yaw)],
  ];
  const positiveXKey = positiveXKeyCandidates.sort((left, right) => right[1] - left[1])[0][0];
  await page.keyboard.down(positiveXKey);
  await expect.poll(async () => (await snap()).player.x, { timeout: 15000 }).toBeGreaterThan(2.25);
  await page.keyboard.up(positiveXKey);
  await expect
    .poll(async () => (await snap()).camera.avatarOpacity, { timeout: 15000 })
    .toBeLessThan(0.95);
  await page.screenshot({ path: 'evidence/art-camera-near.png' });
  expect(errors).toEqual([]);
});
