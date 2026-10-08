import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  initSentry,
  captureException,
  captureMessage,
  addBreadcrumb,
  withErrorBoundary,
  scrubUrl,
  scrubData,
  resetSentry
} from '../src/observability/sentry.js';

describe('Sentry Observability', () => {
  beforeEach(() => {
    resetSentry();
    vi.restoreAllMocks();
  });

  it('skips initialization if no DSN is provided', async () => {
    const success = await initSentry({ dsn: '' });
    expect(success).toBe(false);
  });

  it('initializes with mock Sentry library when DSN is present', async () => {
    const mockSentry = {
      init: vi.fn(),
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      addBreadcrumb: vi.fn()
    };

    const success = await initSentry({
      dsn: 'https://test@sentry.io/12345',
      sentryLibrary: mockSentry
    });

    expect(success).toBe(true);
    expect(mockSentry.init).toHaveBeenCalled();
  });

  it('scrubs sensitive tokens from URLs and payloads', () => {
    const url = 'https://api.coingecko.com/v3?token=secret123&coin=bitcoin';
    const scrubbed = scrubUrl(url);
    expect(scrubbed).toContain('token=%5BREDACTED%5D');
    expect(scrubbed).toContain('coin=bitcoin');

    const data = { auth_key: 'top_secret', user: 'alex' };
    const cleanData = scrubData(data);
    expect(cleanData.auth_key).toBe('[REDACTED]');
    expect(cleanData.user).toBe('alex');
  });

  it('captures exception and withErrorBoundary rethrows if no fallback provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      withErrorBoundary(() => {
        throw new Error('Test Failure');
      });
    }).toThrow('Test Failure');

    expect(spy).toHaveBeenCalled();
  });

  it('withErrorBoundary returns fallback when specified', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = withErrorBoundary(() => {
      throw new Error('Handled error');
    }, 'fallback_value');

    expect(result).toBe('fallback_value');
  });

  it('captures message and adds breadcrumbs via Sentry client or fallback', async () => {
    const mockSentry = {
      init: vi.fn(),
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      addBreadcrumb: vi.fn()
    };

    await initSentry({ dsn: 'https://test@sentry.io/123', sentryLibrary: mockSentry });

    captureMessage('Important notice', 'warning');
    expect(mockSentry.captureMessage).toHaveBeenCalledWith('Important notice', 'warning');

    addBreadcrumb({ message: 'Clicked checkout button' });
    expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({ message: 'Clicked checkout button' });

    captureException(new Error('Boom'), { detail: 'crash' });
    expect(mockSentry.captureException).toHaveBeenCalled();
  });
});
