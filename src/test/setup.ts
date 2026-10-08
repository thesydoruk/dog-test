import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { server } from './server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  server.resetHandlers();
  window.localStorage.clear();
});

afterAll(() => server.close());
