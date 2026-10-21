import { test, expect } from '@playwright/test';
test('Canvas atual: cena WebGL2 real', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.waitForTimeout(2000);
  const gl = await page.locator('canvas').evaluate((c: HTMLCanvasElement) => {
    const g = c.getContext('webgl2');
    return g ? { version: g.getParameter(g.VERSION), width: g.drawingBufferWidth } : null;
  });
  expect(gl?.version).toContain('WebGL 2');
  expect(gl!.width).toBeGreaterThan(0);
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'evidence/engine-current.png' });
});
