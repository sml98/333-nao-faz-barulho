import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  webServer: [
    { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: true },
    { command: 'npm start', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
  ],
  timeout: 360000,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    viewport: { width: 640, height: 360 },
    launchOptions: {
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
  },
});
