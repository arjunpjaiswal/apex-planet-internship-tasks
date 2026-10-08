# Observability & Monitoring Architecture

This document describes the observability strategy implemented in `apexplanet-internship-tasks` for production readiness.

---

## 1. Error Tracking (Sentry)
Located in `src/observability/sentry.js` and initialized globally in `src/observability/sentry-global.js`.

- **Conditional Initialization**: Automatically skips client initialization if `VITE_SENTRY_DSN` is not present, falling back gracefully to formatted console logging.
- **Data Scrubbing**: The `beforeSend` hook actively sanitizes sensitive URL query parameters (such as `token`, `key`, `secret`, `auth`, `bearer`) and strips sensitive fields from error payloads before network egress.
- **Global Handlers**: Intercepts unhandled exceptions via `window.addEventListener('error')` and unhandled promise rejections via `window.addEventListener('unhandledrejection')`.
- **Safe Execution Wrapping**: Exposes `withErrorBoundary(fn, fallback)` to wrap risky operational blocks.

---

## 2. Real User Monitoring (Core Web Vitals)
Located in `src/observability/vitals.js` and `src/observability/vitals-overlay.js`.

- **Tracked Metrics**:
  - **LCP (Largest Contentful Paint)**: Good `< 2500ms`, Needs Improvement `2500–4000ms`, Poor `> 4000ms`
  - **INP (Interaction to Next Paint)**: Good `< 200ms`, Needs Improvement `200–500ms`, Poor `> 500ms`
  - **CLS (Cumulative Layout Shift)**: Good `< 0.1`, Needs Improvement `0.1–0.25`, Poor `> 0.25`
  - **FCP (First Contentful Paint)**: Good `< 1800ms`, Needs Improvement `1800–3000ms`, Poor `> 3000ms`
  - **TTFB (Time to First Byte)**: Good `< 800ms`, Needs Improvement `800–1800ms`, Poor `> 1800ms`
- **Automated Alerts**: Metrics categorized as `poor` trigger Sentry warning events.
- **Beacon Ingestion**: If configured via `VITE_VITALS_ENDPOINT`, telemetry is dispatched asynchronously using `navigator.sendBeacon`.
- **Developer HUD**: When running locally (`localhost`), the HUD mounts in the bottom-right corner, updating metric states every 500ms.
- **Zero-Dependency Fallback**: `src/observability/vitals-standalone.js` provides a native `PerformanceObserver` fallback when viewing HTML pages directly via `file://` protocol without the Vite bundling pipeline.

---

## 3. Client Event Analytics
Located in `src/observability/analytics.js`.

- **Queue Management**: Events are buffered into browser `localStorage` up to a strict cap of 100 items to prevent storage unbounded growth.
- **Session Continuity**: Maintains a persistent, unique `sessionId` in `sessionStorage` across page navigations.
- **Flush Cadence**: Flushes buffered payloads every 30 seconds and guarantees flush triggers via `document.addEventListener('visibilitychange')` when the tab transitions to `hidden`.

---

## 4. Offline & Caching Telemetry (Service Worker)
Located in `public/sw.js` and `public/sw-register.js`.

- **Cache-First**: Static CSS, JS, and image bundles are served from Cache Storage.
- **Network-First**: Top-level document navigations attempt fresh network fetches before falling back to cached HTML.
- **Stale-While-Revalidate**: CoinGecko API calls are cached for 60 seconds using the `x-sw-cached-at` response header. Revalidation requests happen asynchronously in the background.
