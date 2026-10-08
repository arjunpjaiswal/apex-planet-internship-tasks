/**
 * Sentry Observability Module
 * Handles error tracking, breadcrumb logging, and context scrubbing.
 */

let sentryClient = null;
let isInitialized = false;

const SENSITIVE_KEYS = ['token', 'key', 'secret', 'password', 'auth', 'bearer'];

/**
 * Scrub sensitive keys and query parameters from URLs and payloads
 */
export function scrubUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.includes('?')) {
    return url;
  }
  try {
    const isAbsolute = url.startsWith('http://') || url.startsWith('https://');
    const parsed = new URL(url, 'https://apexplanet.internal');
    for (const key of parsed.searchParams.keys()) {
      if (SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s))) {
        parsed.searchParams.set(key, '[REDACTED]');
      }
    }
    return isAbsolute ? parsed.toString() : (parsed.pathname + parsed.search);
  } catch {
    return url.replace(/(token|key|secret|password)=([^&]+)/gi, '$1=[REDACTED]');
  }
}

export function resetSentry() {
  sentryClient = null;
  isInitialized = false;
}

export function scrubData(data) {
  if (!data || typeof data !== 'object') return data;
  const cleaned = Array.isArray(data) ? [] : {};
  for (const [k, v] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some(s => keyMatches(k))) {
      cleaned[k] = '[REDACTED]';
    } else if (v && typeof v === 'object') {
      cleaned[k] = scrubData(v);
    } else if (typeof v === 'string') {
      cleaned[k] = scrubUrl(v);
    } else {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

function keyMatches(k) {
  return SENSITIVE_KEYS.some(s => k.toLowerCase().includes(s));
}

export function beforeSend(event) {
  if (!event) return null;
  if (event.request?.url) {
    event.request.url = scrubUrl(event.request.url);
  }
  if (event.extra) {
    event.extra = scrubData(event.extra);
  }
  return event;
}

export async function initSentry(options = {}) {
  const dsn = options.dsn ?? (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SENTRY_DSN : '');
  if (!dsn) {
    resetSentry();
    return false;
  }

  try {
    const Sentry = options.sentryLibrary ?? await import('@sentry/browser');
    sentryClient = Sentry;
    Sentry.init({
      dsn,
      environment: options.environment ?? (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SENTRY_ENV : 'development'),
      release: options.release ?? (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_APP_VERSION : '1.0.0'),
      beforeSend,
      ...options
    });
    isInitialized = true;
    return true;
  } catch (err) {
    console.warn('[Sentry] Failed to initialize Sentry:', err);
    return false;
  }
}

export function captureException(error, context = {}) {
  const safeContext = scrubData(context);
  if (isInitialized && sentryClient) {
    sentryClient.captureException(error, { extra: safeContext });
  } else {
    console.error('[Sentry Local Fallback] Exception:', error, safeContext);
  }
}

export function captureMessage(message, level = 'info') {
  if (isInitialized && sentryClient) {
    sentryClient.captureMessage(message, level);
  } else {
    console.warn(`[Sentry Local Fallback] ${level.toUpperCase()}: ${message}`);
  }
}

export function addBreadcrumb(breadcrumb) {
  if (isInitialized && sentryClient) {
    sentryClient.addBreadcrumb(breadcrumb);
  }
}

export function withErrorBoundary(fn, fallback) {
  try {
    return fn();
  } catch (err) {
    captureException(err, { source: 'withErrorBoundary' });
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}
