import { defineConfig, devices, type Project } from '@playwright/test';

const HOST = '127.0.0.1';
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;
const isCI = Boolean(process.env.CI);

/** Every e2e test runs at each of these sizes (mobile first: smallest first). */
export const VIEWPORTS = {
  'mobile-s': { width: 320, height: 568 },
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  wide: { width: 1920, height: 1080 },
} as const;

const BROWSERS = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
} as const;

const projects: Project[] = Object.entries(BROWSERS).flatMap(([browser, device]) =>
  Object.entries(VIEWPORTS).map(([size, viewport]) => ({
    name: `${browser}-${size}`,
    use: { ...device, viewport },
  })),
);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  // Headless Firefox and WebKit on Windows get starved under parallel load, so the
  // timeouts are generous; a healthy test finishes in a few seconds.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    // Recording a trace for every test is expensive; only record retries.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects,
  webServer: {
    // Bind to IPv4 explicitly: Vite listens on ::1 for `localhost`, while Firefox tries
    // 127.0.0.1 first and waits for the fallback, adding ~2s to every navigation.
    command: `npx vite build && npx vite preview --host ${HOST} --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
