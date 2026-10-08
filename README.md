# ApexPlanet Frontend Internship — 5 Tasks

Submitted by Arjun, Frontend Development Intern at ApexPlanet.
Reviewer: Technical Mentor (Senior Frontend Engineer).

---

## 📌 Executive Overview

This repository represents the cumulative deliverables for the ApexPlanet Frontend Engineering Internship. It includes 5 production-grade client applications, an enterprise design system documented in Storybook, comprehensive unit testing achieving over 80% coverage with Vitest, cross-browser Playwright end-to-end test suites, progressive web app (PWA) offline caching, and real-time observability telemetry (Sentry + Core Web Vitals HUD + LocalStorage analytics queuing).

---

## 🗂️ Completed Tasks Matrix

| Task | Title | Location | Key Technologies & Architecture |
| :--- | :--- | :--- | :--- |
| **01** | **Kanban Board** | [`tasks/task1-kanban.html`](file:///C:/Users/arjun/.gemini/antigravity/scratch/apexplanet-internship-tasks/tasks/task1-kanban.html) | Native HTML5 Drag & Drop (zero dependencies), undo/redo snapshot stack (Ctrl+Z/Ctrl+Y, max 50 entries), LocalStorage persistence, JSON export/import, native `<dialog>` modal, XSS sanitization. |
| **02** | **Custom Video Player & Analytics** | [`tasks/task2-video-player.html`](file:///C:/Users/arjun/.gemini/antigravity/scratch/apexplanet-internship-tasks/tasks/task2-video-player.html) | Custom controls (no native controls allowed), thumbnail preview tooltip on seek bar hover, keyboard shortcuts (Space, arrows, M, F), Picture-in-Picture, live 60-bucket Canvas engagement telemetry chart, throttled LocalStorage analytics save (5s). |
| **03** | **Expense Tracker & Canvas Charts** | [`tasks/task3-expense-tracker.html`](file:///C:/Users/arjun/.gemini/antigravity/scratch/apexplanet-internship-tasks/tasks/task3-expense-tracker.html) | Manual HTML5 2D Canvas charting (zero Chart.js/external chart libraries): Pie chart (category expense breakdown + legend), Line chart (balance trend), Bar chart (income vs expense). Auto-generated monthly recurring transactions, budget threshold states (ok/warn/over), linear regression balance prediction, CSV File API import/export. |
| **04** | **Virtual Scrolling Chat** | [`tasks/task4-chat.html`](file:///C:/Users/arjun/.gemini/antigravity/scratch/apexplanet-internship-tasks/tasks/task4-chat.html) | High-performance virtualized scrolling rendering 10,000 mock messages with fixed 60px item heights, keeping DOM nodes capped at ~30 visible nodes. Regex case-insensitive search with `<mark>` highlighting, optimistic UI (sending &rarr; sent in 600ms), simulated WebSocket incoming messages every 8s with typing indicator, and scroll-lock pill. |
| **05** | **Crypto Market Dashboard** | [`tasks/task5-dashboard.html`](file:///C:/Users/arjun/.gemini/antigravity/scratch/apexplanet-internship-tasks/tasks/task5-dashboard.html) | CoinGecko real market API integration, custom Redux-like store with thunk support, `sessionStorage` cache with 60s TTL and stale-while-revalidate (SWR) background refresh, exponential backoff with HTTP 429 rate limit handling, `AbortController` cancellation, URL state deep-link sync (`?q=&cur=&coin=`), and Canvas sparkline gradient area charts. |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Setup Steps
```bash
# 1. Clone the repository
git clone https://github.com/apexplanet/apexplanet-internship-tasks.git
cd apexplanet-internship-tasks

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local

# 4. Start local development server (Vite on port 5173)
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) to access the landing portal and open each task.

---

## 🔬 Testing Suites

### Unit Tests & Code Coverage (Vitest)
Unit tests isolate pure business logic in `src/*.logic.js` and `src/store.js`.
```bash
# Run unit tests
npm test

# Run unit tests with V8 coverage report
npm run test:coverage
```

> **Coverage Thresholds**: Enforced at minimum **80% Lines**, **80% Functions**, and **75% Branches** in `vitest.config.js`.

### End-to-End Tests (Playwright)
Cross-browser verification covers Chromium, Firefox, WebKit (Safari), and Mobile iPhone 13.
```bash
# Install Playwright browser binaries
npx playwright install --with-deps

# Run end-to-end test suite
npm run test:e2e
```

---

## 🎨 Storybook Design System

The living component library documents the atomic design system:
```bash
# Start Storybook locally on port 6006
npm run storybook

# Build static Storybook site
npm run build-storybook

# Visual regression testing via Chromatic
npm run chromatic
```

- **Covered Components**:
  - `Button`: 7 variants (Primary, Secondary, Outline, Danger, Success, Ghost, Icon), 3 sizes, disabled states.
  - `Card`: Default, Elevated, Outlined.
  - `CoinCard`: Live canvas sparkline, positive/negative market indicators.
  - `StatCard`: Metric displays, delta trends, icons.
- **Addons**: `@storybook/addon-a11y`, `@storybook/addon-themes`, `@storybook/addon-essentials`, `@storybook/addon-interactions`.

---

## 🚢 Deployment Strategies

| Platform | Configuration | Command |
| :--- | :--- | :--- |
| **Netlify** | [`netlify.toml`](file:///C:/Users/arjun/.gemini/antigravity/scratch/apexplanet-internship-tasks/netlify.toml) | `npm run deploy` (Builds to `dist/`, SPA redirects, security headers) |
| **Vercel** | [`vercel.json`](file:///C:/Users/arjun/.gemini/antigravity/scratch/apexplanet-internship-tasks/vercel.json) | `vercel --prod` (Immutable asset caching, SPA routing) |
| **Docker** | [`Dockerfile`](file:///C:/Users/arjun/.gemini/antigravity/scratch/apexplanet-internship-tasks/Dockerfile) + [`nginx.conf`](file:///C:/Users/arjun/.gemini/antigravity/scratch/apexplanet-internship-tasks/nginx.conf) | `docker build -t apexplanet-tasks . && docker run -p 80:80 apexplanet-tasks` |

---

## 📊 Observability & Monitoring

Documented in detail in [`docs/monitoring.md`](file:///C:/Users/arjun/.gemini/antigravity/scratch/apexplanet-internship-tasks/docs/monitoring.md):
- **Sentry Error Tracking**: Scrubbing sensitive URL query parameters (tokens, keys, secrets) via `beforeSend` hook.
- **Core Web Vitals Monitoring**: Live evaluation of LCP, INP, CLS, FCP, TTFB. Includes a developer HUD pinned to the viewport on `localhost` and a zero-dependency fallback for `file://` protocol.
- **Client Analytics**: Buffered localStorage queue capped at 100 events, session ID maintained in sessionStorage, auto-flushed every 30s and on tab hide (`visibilitychange`).

---

## 🔒 Security Headers & PWA

- **Security Headers**:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **Progressive Web App**:
  - Offline-first Service Worker with static caching (`public/sw.js`).
  - Cache-first strategy for static assets (`/assets/*`).
  - Stale-While-Revalidate for CoinGecko API requests using `x-sw-cached-at` header.
  - Auto-update notification via `public/sw-register.js`.

---

## 💡 What I Learned During This Internship

### Task 1: Kanban Board
- Mastered the native HTML5 Drag and Drop API (`dragstart`, `dragover`, `dragleave`, `drop`) without external libraries.
- Implemented an immutable snapshot history stack with bounded capacity ($O(1)$ push/undo/redo).
- Deepened understanding of DOM XSS prevention by building an explicit text escaping pipeline.

### Task 2: Custom Video Player & Analytics
- Designed a custom media playback engine using the HTML5 `HTMLVideoElement` API.
- Implemented real-time Canvas rendering to visualize engagement density over 60 discrete temporal buckets.
- Handled edge cases in media events (`timeupdate`, `buffered`, `progress`, Picture-in-Picture lifecycle).

### Task 3: Expense Tracker & Manual Canvas Charts
- Developed low-level 2D Canvas rendering routines for trigonometric pie slices, dynamic linear trend lines, and grouped bar histograms.
- Implemented linear regression prediction algorithms ($y = mx + b$) for balance forecasting.
- Wrote a zero-dependency CSV tokenizer handling double quotes, commas, and line breaks.

### Task 4: Virtual Scrolling Chat
- Implemented a viewport slicing algorithm that maps scroll offset to index ranges, maintaining ~30 DOM nodes regardless of the 10,000-message list size.
- Structured optimistic UI updates to achieve responsive feedback before simulated network confirmation.
- Implemented regular expression query sanitization for live string highlighting.

### Task 5: Crypto Dashboard
- Built a Redux-compliant state management store featuring actions, reducers, subscriptions, and asynchronous thunk dispatchers.
- Architected a resilient network layer incorporating `AbortController` cancellation, exponential backoff retries, and HTTP 429 rate limit fallbacks.
- Synchronized multi-faceted state (search query, currency, selected coin) bi-directionally with browser URL search parameters.

---

## 📄 License
MIT &copy; 2026 ApexPlanet & Intern Arjun.
