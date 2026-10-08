/**
 * Standalone zero-dependency Web Vitals Observer using native PerformanceObserver API
 */
(function () {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  const metrics = {};

  function log(name, value, unit = 'ms') {
    metrics[name] = value;
    const formatted = unit === 'ms' ? Math.round(value) + 'ms' : value.toFixed(3);
    console.log(`%c[Vitals Standalone] ${name}: ${formatted}`, 'color: #3b82f6; font-weight: bold;');
  }

  try {
    // FCP
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntriesByName('first-contentful-paint')) {
        log('FCP', entry.startTime);
      }
    }).observe({ type: 'paint', buffered: true });

    // LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) log('LCP', lastEntry.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // CLS
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          log('CLS', clsValue, '');
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });

    // TTFB
    const navEntry = performance.getEntriesByType('navigation')[0];
    if (navEntry) {
      log('TTFB', navEntry.responseStart);
    }
  } catch (e) {
    // PerformanceObserver type unsupported
  }
})();
