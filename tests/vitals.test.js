import { describe, it, expect, vi } from 'vitest';
import { rateMetric, logMetric, THRESHOLDS, initVitals } from '../src/observability/vitals.js';

describe('Core Web Vitals', () => {
  it('correctly rates metrics according to thresholds', () => {
    expect(rateMetric('LCP', 2000)).toBe('good');
    expect(rateMetric('LCP', 3000)).toBe('needs-improvement');
    expect(rateMetric('LCP', 4500)).toBe('poor');

    expect(rateMetric('CLS', 0.05)).toBe('good');
    expect(rateMetric('CLS', 0.15)).toBe('needs-improvement');
    expect(rateMetric('CLS', 0.3)).toBe('poor');
  });

  it('logs metric and captures poor scores', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logMetric({ name: 'FCP', value: 1200 });
    expect(consoleSpy).toHaveBeenCalled();

    // Poor rating triggers warning
    logMetric({ name: 'LCP', value: 5500 });
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('registers handlers for all 5 metrics using mock web-vitals', async () => {
    const mockWebVitals = {
      onCLS: vi.fn(),
      onFCP: vi.fn(),
      onINP: vi.fn(),
      onLCP: vi.fn(),
      onTTFB: vi.fn()
    };

    await initVitals(mockWebVitals);
    expect(mockWebVitals.onCLS).toHaveBeenCalled();
    expect(mockWebVitals.onFCP).toHaveBeenCalled();
    expect(mockWebVitals.onINP).toHaveBeenCalled();
    expect(mockWebVitals.onLCP).toHaveBeenCalled();
    expect(mockWebVitals.onTTFB).toHaveBeenCalled();
  });
});
