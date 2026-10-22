import { test, expect } from '@playwright/test';
import { snap, go } from './helpers';
test.use({ deviceScaleFactor: 0.5 });

async function hideUntilPorteiroLeaves(
  page: Parameters<typeof snap>[0],
  spot: 'armario_oeste' | 'carrinho_leste' | 'alcova_servico',
) {
  await page.keyboard.press('e');
  await expect.poll(async () => (await snap(page)).hidden).toBe(spot);
  await expect
    .poll(
      async () => {
        const s = await snap(page);
        return (
          s.phase === 'PLAYING' &&
          ['PATROL', 'RETURN'].includes(s.porteiro.state) &&
          Math.hypot(s.porteiro.position.x - s.player.x, s.porteiro.position.z - s.player.z) > 8
        );
      },
      { timeout: 120000, intervals: [300] },
    )
    .toBe(true);
  await page.keyboard.press('e');
  await expect.poll(async () => (await snap(page)).hidden).toBeNull();
}

test('três encomendas liberam o retorno ao elevador, dificuldade tranquila', async ({ page }) => {
  test.setTimeout(600000);
  await page.setViewportSize({ width: 480, height: 270 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  // This scenario covers the complete delivery flow; the normal-mode chase and
  // capture are exercised independently by art-chase.spec and capture.spec.
  await page.locator('#difficulty').selectOption('easy');
  await page.locator('#quality').selectOption('low');
  await page.getByTestId('start').click();
  await expect.poll(async () => (await snap(page)).time).toBeGreaterThan(0.1);
  await page.keyboard.press('e');
  await expect.poll(async () => (await snap(page)).held).toBe(true);
  await go(page, 0, -6);
  await go(page, -14.7, -6);
  await go(page, -14.7, 6);
  await go(page, -10.5, 6);
  await page.keyboard.press('e');
  await expect.poll(async () => (await snap(page)).delivered).toBe(1);
  await go(page, -14.7, 6);
  await go(page, -14.7, -6);
  await go(page, 0, -6);
  await go(page, 0, -12);
  await page.keyboard.press('e');
  await expect.poll(async () => (await snap(page)).held).toBe(true);
  await go(page, 0, -6);
  await go(page, -14.7, -6);
  await go(page, -14.7, 5.1);
  await go(page, 0, 5.1);
  await go(page, 0, 6.4);
  await page.keyboard.press('e');
  await expect.poll(async () => (await snap(page)).delivered).toBe(2);
  await page.screenshot({ path: 'evidence/marco2-segunda.png' });
  await go(page, 0, 5.1);
  await go(page, -14.7, 5.1);
  await go(page, -14.7, -6.8);
  await go(page, -4.5, -6);
  await hideUntilPorteiroLeaves(page, 'alcova_servico');
  await go(page, 0, -6.8);
  await go(page, 0, -6);
  await go(page, 0, -12);
  await page.keyboard.press('e');
  await expect.poll(async () => (await snap(page)).held).toBe(true);
  await go(page, 0, -6.8);
  await go(page, 14.7, -6.8);
  await go(page, 14.7, -6);
  await go(page, 14.7, 5.1);
  await go(page, 10.5, 5.1);
  await go(page, 10.5, 6.4);
  await page.keyboard.press('e');
  await expect.poll(async () => (await snap(page)).delivered).toBe(3);
  expect((await snap(page)).phase).toBe('PLAYING');
  await expect(page.getByTestId('objective')).toContainText('Volte ao elevador');
  await page.screenshot({ path: 'evidence/marco2-terceira.png' });
  expect(errors).toEqual([]);
});
