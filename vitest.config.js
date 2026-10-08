import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: [
        'src/*.logic.js',
        'src/store.js',
        'src/observability/analytics.js',
        'src/observability/sentry.js',
        'src/observability/vitals.js'
      ],
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75
      }
    }
  }
});
