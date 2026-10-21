import { test, expect } from '@playwright/test';
test('produção: WebGL2, input real, pausa e nenhum snapshot de debug', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.setViewportSize({ width: 854, height: 480 });
  await page.goto('http://127.0.0.1:4173');
  await page.locator('#quality').selectOption('low');
  await page.getByTestId('start').click({ timeout: 60000 });
  await expect(page.getByTestId('context')).toContainText('Pegar', { timeout: 30000 });
  expect(
    await page.evaluate(() => typeof (window as unknown as { snapshot?: unknown }).snapshot),
  ).toBe('undefined');
  expect(
    await page
      .locator('canvas')
      .evaluate((c: HTMLCanvasElement) =>
        c.getContext('webgl2')?.getParameter(c.getContext('webgl2')!.VERSION),
      ),
  ).toContain('WebGL 2');
  await page.keyboard.down('w');
  await expect(page.getByTestId('context')).toHaveText('', { timeout: 40000 });
  await page.keyboard.up('w');
  await page.screenshot({ path: 'evidence/cartoon-gameplay-producao.png' });
  await page.keyboard.press('Escape');
  await expect(page.locator('#ui')).toHaveAttribute('data-phase', 'PAUSED');
  await page.getByTestId('start').click();
  await expect(page.locator('#ui')).toHaveAttribute('data-phase', 'PLAYING');
  expect(errors).toEqual([]);
});
