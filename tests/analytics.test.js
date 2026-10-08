import { describe, it, expect } from 'vitest';
import { track, flushQueue, getPendingEventsCount } from '../src/observability/analytics.js';

describe('Analytics Tracker', () => {
  it('queues events and maintains a stable session id', () => {
    const evt1 = track('button_click', { button: 'login' });
    const evt2 = track('search', { query: 'eth' });

    expect(evt1.sessionId).toBe(evt2.sessionId);
    expect(getPendingEventsCount()).toBe(2);
  });

  it('caps the event queue at 100 items', () => {
    for (let i = 0; i < 110; i++) {
      track('bulk_event', { index: i });
    }
    expect(getPendingEventsCount()).toBe(100);
  });

  it('flushes queued events', () => {
    track('test_flush', {});
    expect(getPendingEventsCount()).toBeGreaterThan(0);

    const count = flushQueue();
    expect(count).toBeGreaterThan(0);
    expect(getPendingEventsCount()).toBe(0);

    // Empty flush returns 0
    expect(flushQueue()).toBe(0);
  });

  it('handles corrupted localStorage without crashing', () => {
    localStorage.setItem('apexplanet_analytics_queue', 'INVALID_JSON{{{');
    expect(getPendingEventsCount()).toBe(0);
  });
});
