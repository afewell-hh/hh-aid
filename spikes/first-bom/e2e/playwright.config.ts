import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: '.', timeout: 60_000, workers: 1, reporter: [['list']], use: { headless: true, viewport: { width: 1280, height: 900 } }, outputDir: '../test-results' });
