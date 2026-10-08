/**
 * Core Web Vitals Monitor
 */
import { captureMessage } from './sentry.js';

export const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  INP: { good: 200, needsImprovement: 500 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 }
};

export const vitalsStore = {
  LCP: null,
  INP: null,
  CLS: null,
  FCP: null,
  TTFB: null
};

export function rateMetric(name, value) {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'good';
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

export function logMetric(metric) {
  const { name, value } = metric;
  const rating = rateMetric(name, value);
  vitalsStore[name] = { value, rating };

  const colors = {
    'good': '#10b981',
    'needs-improvement': '#f59e0b',
    'poor': '#ef4444'
  };

  const formattedVal = name === 'CLS' ? value.toFixed(3) : Math.round(value) + 'ms';
  if (typeof console !== 'undefined' && console.log) {
    console.log(
      `%c[Core Web Vitals] ${name}: ${formattedVal} (${rating.toUpperCase()})`,
      `color: white; background: ${colors[rating]}; padding: 2px 6px; border-radius: 3px; font-weight: bold;`
    );
  }

  if (rating === 'poor') {
    captureMessage(`Poor Web Vital ${name}: ${formattedVal}`, 'warning');
  }

  const endpoint = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_VITALS_ENDPOINT : '';
  if (endpoint && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const payload = JSON.stringify({
      metric: name,
      value,
      rating,
      page: window.location.pathname,
      timestamp: Date.now()
    });
    navigator.sendBeacon(endpoint, payload);
  }
}

export async function initVitals(lib) {
  try {
    const webVitals = lib ?? await import('web-vitals');
    if (webVitals.onCLS) webVitals.onCLS(logMetric);
    if (webVitals.onFCP) webVitals.onFCP(logMetric);
    if (webVitals.onINP) webVitals.onINP(logMetric);
    if (webVitals.onLCP) webVitals.onLCP(logMetric);
    if (webVitals.onTTFB) webVitals.onTTFB(logMetric);
  } catch (err) {
    // web-vitals package fallback
  }
}
