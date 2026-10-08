/**
 * Global Error Handlers for Sentry Observability
 */
import { initSentry, captureException } from './sentry.js';

initSentry();

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    captureException(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    captureException(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
      type: 'unhandledrejection'
    });
  });
}
