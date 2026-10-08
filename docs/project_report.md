# Technical Project Report: ApexPlanet Frontend Engineering Internship

**Author:** Arjun, Frontend Development Intern  
**Company:** ApexPlanet  
**Reviewer:** Technical Mentor (Senior Frontend Engineer)  
**Project Repository:** [github.com/arjunpjaiswal/apex-planet-internship-tasks](https://github.com/arjunpjaiswal/apex-planet-internship-tasks)  
**Live Deployment:** [arjunpjaiswal.github.io/apex-planet-internship-tasks/](https://arjunpjaiswal.github.io/apex-planet-internship-tasks/)  
**Evaluation Criteria:** Code Quality, Feature Completeness, Testing, Documentation, Deployability  

---

## 1. Executive Summary

This report documents the architectural design, implementation details, test coverage, and deployment infrastructure of the 5 internship tasks developed for **ApexPlanet**.

The project was constructed as a zero-UI-dependency, production-grade frontend portfolio meeting strict senior engineering standards:
1. **Zero External UI Libraries**: No Tailwind, Bootstrap, jQuery, Chart.js, or pre-built component kits. Every component, layout, and visual chart is implemented with vanilla CSS and native HTML5 Canvas APIs.
2. **High Code Quality & Reliability**: Pure logic extraction with **94.14% statement coverage**, **81.18% branch coverage**, and 42 passing unit tests using Vitest and JSDOM.
3. **Enterprise Observability**: Integrated Sentry error capturing with sensitive parameter scrubbing (`token`, `key`, `secret`), Core Web Vitals tracking (LCP, INP, CLS, FCP, TTFB) with a developer HUD, and throttled client event queuing.
4. **Offline Capability & PWA**: Service Worker caching implementing Cache-First, Network-First, and Stale-While-Revalidate (SWR) policies with automated update prompts.
5. **Continuous Deployment**: Automated CI pipeline via GitHub Actions and live deployment on GitHub Pages.

---

## 2. System Architecture & Project Topology

```
apexplanet-internship-tasks/
├── .github/workflows/
│   ├── ci.yml                 # 5-stage automated CI (lint -> test -> e2e -> storybook -> deploy)
│   └── deploy-pages.yml       # Automated GitHub Pages deployment pipeline
├── .storybook/                # Storybook 8 HTML-Vite configuration, preview, theme decorator
├── docs/
│   ├── monitoring.md          # Observability, Sentry, Core Web Vitals, and analytics guide
│   └── project_report.md      # This comprehensive engineering report
├── e2e/
│   ├── kanban.spec.js         # Playwright E2E: card creation, undo, reload persistence
│   └── dashboard.spec.js      # Playwright E2E: API route mocking, URL state synchronization
├── public/
│   ├── manifest.json          # Standalone PWA manifest
│   ├── sw.js                  # Service Worker with Cache-First & SWR strategies
│   └── sw-register.js         # Service Worker registration with update prompt
├── src/
│   ├── components/            # Design system tokens, Button, Card, CoinCard, StatCard
│   ├── observability/         # Sentry, Sentry Global, Vitals, Vitals HUD, Analytics
│   ├── chat.logic.js          # Pure virtual scroll and regex highlight algorithms
│   ├── expense.logic.js       # Pure financial totals, month bucketing, regression, CSV
│   ├── kanban.logic.js        # Pure DnD state transformations, history stack
│   └── store.js               # Redux-compliant store with thunks and combineReducers
├── stories/                   # Storybook stories with controls and accessibility tags
├── tasks/                     # 5 standalone HTML web applications
├── tests/                     # 7 Vitest test suites + JSDOM setup polyfill
├── Dockerfile & nginx.conf    # Multi-stage production container configuration
├── netlify.toml & vercel.json # Security headers (DENY, nosniff) and CDN cache policies
├── vite.config.js             # Multi-page build configuration with relative base
└── package.json               # Node 20+ scripts and dependency manifest
```

---

## 3. Deep-Dive: The 5 Internship Tasks

### Task 1: Kanban Board (`tasks/task1-kanban.html`)
The goal was to build a full-featured Trello-style board using native HTML5 APIs without external libraries.

* **Native Drag & Drop**: Implemented using native event listeners (`dragstart`, `dragover`, `dragleave`, `drop`) on cards and column containers. Drop targets calculate proximity via client bounding rect geometry (`getDragAfterElement`) for card reordering.
* **Bounded Snapshot History Stack**: State history stack with $O(1)$ operations:
  $$\text{Capacity} = 50 \text{ snapshots}$$
  Supports `Ctrl+Z` (Undo) and `Ctrl+Y` / `Ctrl+Shift+Z` (Redo) with automated stack truncation when new actions occur.
* **Security & XSS Prevention**: All user-supplied text rendered to the DOM passes through an explicit HTML entity escaping pipeline (`&`, `<`, `>`, `"`, `'`).
* **Modal Dialogs**: Add/edit operations utilize the HTML5 `<dialog>` API with backdrop filtering and keyboard escape behavior.
* **Data Portability**: Full JSON export and File API import with structural schema validation.

### Task 2: Custom Video Player & Analytics (`tasks/task2-video-player.html`)
The objective was to create a YouTube-grade media player with analytics without using `<video controls>`.

* **Custom Media Controls**: Native controls are hidden. Built custom play/pause toggle, volume slider with mute toggling, playback rate selection (0.5x–2.0x), Picture-in-Picture API, and fullscreen toggling.
* **Seek Bar Hover Tooltip**: Dynamic timeline scrubbing with buffered segment visualization (`video.buffered`) and timestamp preview tooltip calculation on `mousemove`.
* **Live Canvas Engagement Chart**: Custom HTML5 2D Canvas rendering 60 discrete temporal buckets across the video duration. Real-time playback increments bucket intensity, rendering a dynamic heatmap histogram.
* **Keyboard Navigation**: Space (play/pause), Left/Right arrows (&plusmn;10s seek), Up/Down arrows (&plusmn;10% volume), `M` (mute), `F` (fullscreen).
* **Analytics Persistence**: Session watch time, completion percentage, pause frequency, and seek counts are throttled and auto-saved to `localStorage` every 5 seconds.

### Task 3: Expense Tracker & Manual Canvas Charts (`tasks/task3-expense-tracker.html`)
The requirement prohibited Chart.js or SVG libraries, mandating manual 2D Canvas rendering.

* **3 Manual Canvas Visualizations**:
  1. *Category Breakdown (Pie Chart)*: Uses trigonometric arc geometry (`ctx.arc`, `ctx.fill`) with dynamic slice offsets and an annotated color legend.
  2. *Monthly Balance Trend (Line Chart)*: Plots chronological balance points with linear gridlines, smooth stroke segments, and coordinate labels.
  3. *Income vs Expense (Grouped Bar Chart)*: Calculates normalized dual-bar histograms with category spacing and responsive value scaling.
* **Linear Regression Balance Prediction**:
  Calculates slope $m$ and intercept $b$ over past monthly balances:
  $$m = \frac{N \sum xy - \sum x \sum y}{N \sum x^2 - (\sum x)^2}, \quad b = \frac{\sum y - m \sum x}{N}$$
  $$y_{next} = m \cdot N + b$$
* **Monthly Recurring Engine**: Automatically detects unbilled recurring transactions on application initialization and generates timestamped ledger entries.
* **Category Budget Limits**: Evaluates category spending against budgeted limits:
  * `ok` ($< 80\%$) &rarr; Green badge
  * `warn` ($80\% - 100\%$) &rarr; Amber badge
  * `over` ($> 100\%$) &rarr; Red badge
* **Robust CSV Parser**: Custom tokenizer parsing CSV strings with quoted fields, internal commas, and double quotes.

### Task 4: Virtual Scrolling Chat (`tasks/task4-chat.html`)
The mentor required handling 10,000 messages smoothly without DOM lag.

* **Virtualized Windowing Algorithm**:
  Fixed item height $h = 60\text{px}$, buffer size $B = 5$:
  $$\text{startIndex} = \max\left(0, \left\lfloor \frac{\text{scrollTop}}{h} \right\rfloor - B\right)$$
  $$\text{endIndex} = \min\left(N, \left\lceil \frac{\text{scrollTop} + \text{clientHeight}}{h} \right\rceil + B\right)$$
  Renders only $\sim 30$ DOM nodes at any instant inside a total spacer of $10,000 \times 60\text{px} = 600,000\text{px}$.
* **Regex Highlight Search**: Sanitizes user queries against regex special characters, highlighting matching substrings in realtime using `<mark class="highlight">`.
* **Optimistic UI**: Dispatches sent messages immediately with pending indicators (`🕒 sending...`), transitioning to delivered receipts (`✓✓`) after 600ms.
* **Simulated WebSocket Stream**: Background intervals deliver random simulated messages every 8 seconds, accompanied by simulated typing indicators.
* **Scroll Retention & Floating Pill**: Auto-scrolls to the newest message only when the user is already at the bottom; if scrolled up, displays a floating notification pill.

### Task 5: Crypto Dashboard & Market Analyzer (`tasks/task5-dashboard.html`)
The goal was to consume a real external API, handle rate limits, and provide deep-linkable state.

* **CoinGecko Integration**: Fetches top cryptocurrency data with market capitalizations, 24h delta percentages, and 7-day sparklines.
* **Custom Redux Store**: Implements the Flux pattern (`getState`, `dispatch`, `subscribe`) with asynchronous thunk middleware and reducer composition (`combineReducers`).
* **Stale-While-Revalidate (SWR) Caching**: Caches payloads in `sessionStorage` with a 60-second TTL. Cached data renders immediately upon load while background fetches revalidate.
* **Network Resilience**: Uses `AbortController` to cancel stale in-flight requests and executes exponential backoff retries when encountering HTTP 429 rate limit responses.
* **Bidirectional URL State Sync**: Deep links synchronize `?q=...&cur=...&coin=...` with the browser URL using `history.replaceState`.
* **Custom Sparkline Area Chart**: Draws 7-day historical prices with vertical linear gradients (green for positive, red for negative).

---

## 4. Verification & Code Coverage

Testing was executed using **Vitest** in a **JSDOM** environment with **V8 coverage**. Pure business logic was decoupled from DOM elements to ensure isolated testability.

### Coverage Results
| File | Statements | Branches | Functions | Lines |
| :--- | :--- | :--- | :--- | :--- |
| `src/chat.logic.js` | **100%** | **100%** | **100%** | **100%** |
| `src/expense.logic.js` | **99.01%** | **83.67%** | **100%** | **99.01%** |
| `src/kanban.logic.js` | **97.94%** | **89.58%** | **100%** | **97.94%** |
| `src/store.js` | **97.05%** | **88.88%** | **100%** | **97.05%** |
| `src/observability/analytics.js` | **92.75%** | **70.58%** | **100%** | **92.75%** |
| `src/observability/sentry.js` | **82.60%** | **70.45%** | **90.00%** | **82.60%** |
| `src/observability/vitals.js` | **83.58%** | **47.05%** | **100%** | **83.58%** |
| **All Files Total** | **94.14%** | **81.18%** | **98.27%** | **94.14%** |

* **Line Coverage**: 94.14% (Threshold: 80%) &mdash; **PASS**
* **Function Coverage**: 98.27% (Threshold: 80%) &mdash; **PASS**
* **Branch Coverage**: 81.18% (Threshold: 75%) &mdash; **PASS**

---

## 5. Living Design System (Storybook)

The design system is managed via `@storybook/html-vite` in `.storybook/` and `stories/`:
- **Components Documented**:
  - `Button`: 7 functional variants (Primary, Secondary, Outline, Danger, Success, Ghost, Icon), 3 sizes (sm, md, lg), disabled state.
  - `Card`: Default, Elevated, and Outlined variants with composable header/body/footer regions.
  - `CoinCard`: Market badge with embedded 2D Canvas sparkline.
  - `StatCard`: KPI display with trend percentage arrows and icons.
- **Addons & A11y**:
  - `@storybook/addon-a11y`: Color-contrast enforcement enabled; region rule disabled for isolated component previews.
  - `@storybook/addon-themes`: Two-way theme switching via `data-theme` attribute (Light / Dark).
  - All stories tagged with `autodocs` for automated documentation generation.

---

## 6. Observability & Progressive Web App

### Observability Pipeline
- **Sentry Error Interception**: Global uncaught exception and unhandled promise rejection listeners. The `beforeSend` hook cleanses sensitive URL parameters (`token`, `key`, `secret`, `auth`, `bearer`).
- **Core Web Vitals**: Real User Monitoring for LCP, INP, CLS, FCP, TTFB. Includes a developer HUD pinned to the bottom-right corner during development and a standalone fallback for `file://` execution.
- **Analytics Queue**: Client events queue into `localStorage` up to a strict cap of 100 items. Auto-flushed every 30 seconds and during document visibility transitions (`hidden`).

### Progressive Web App (PWA)
- **Manifest**: `public/manifest.json` defines standalone display mode and theme color `#3b82f6`.
- **Caching Policies** (`public/sw.js`):
  - *Cache-First*: Pre-caches core HTML pages and static assets (`/assets/*`).
  - *Network-First*: Top-level navigation attempts fresh network requests before falling back to cache.
  - *Stale-While-Revalidate*: CoinGecko API calls are cached for 60 seconds using the custom `x-sw-cached-at` header.
- **Lifecycle Management**: `public/sw-register.js` detects new worker installations and prompts the user to reload.

---

## 7. Deployment & Hosting Strategy

| Environment | Target | Status |
| :--- | :--- | :--- |
| **GitHub Pages** | [arjunpjaiswal.github.io/apex-planet-internship-tasks/](https://arjunpjaiswal.github.io/apex-planet-internship-tasks/) | **Active** (Built via Vite with relative base) |
| **GitHub Actions** | `.github/workflows/deploy-pages.yml` & `ci.yml` | **Configured** |
| **Containerization** | `Dockerfile` & `nginx.conf` | **Ready** (Alpine Node 20 builder &rarr; Nginx 1.27) |
| **Vercel / Netlify** | `vercel.json` & `netlify.toml` | **Ready** (DENY framing, nosniff headers, SPA rewrite) |

---

## 8. Summary of Intern Learnings

1. **Native Web APIs**: Learned how to implement complex interaction patterns (drag-and-drop, custom video players, canvas charts) using modern Web APIs without relying on heavy external dependencies.
2. **State Management**: Built a Redux-like store from scratch with middleware support, gaining a deeper understanding of unidirectional data flow and state immutability.
3. **Performance Optimization**: Solved DOM thrashing at scale by designing a virtual windowing mechanism for 10,000 items, and optimized offline performance using Service Worker caching strategies.
4. **Production Observability**: Understood the necessity of sanitizing error context before dispatching telemetry to remote aggregators and tracking Core Web Vitals to monitor real-user performance.
5. **Testing & CI/CD**: Achieved &gt;94% test coverage by isolating pure business logic and automating multi-stage verification across unit tests, Storybook builds, and cloud deployments.
