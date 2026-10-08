/**
 * Developer HUD for Core Web Vitals
 */
import { vitalsStore, THRESHOLDS, rateMetric } from './vitals.js';

export function mountVitalsOverlay() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('agy-vitals-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'agy-vitals-overlay';
  overlay.setAttribute('style', `
    position: fixed;
    bottom: 12px;
    right: 12px;
    z-index: 99999;
    background: rgba(15, 23, 42, 0.92);
    color: #f8fafc;
    border: 1px solid #334155;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    padding: 8px 12px;
    line-height: 1.4;
    user-select: none;
    backdrop-filter: blur(6px);
  `);

  const render = () => {
    const metrics = ['FCP', 'LCP', 'INP', 'CLS', 'TTFB'];
    let html = '<div style="font-weight:700; margin-bottom:4px; color:#94a3b8; display:flex; justify-content:space-between; align-items:center;"><span>⚡ Web Vitals HUD</span><span id="agy-vitals-close" style="cursor:pointer; padding:0 4px;">✕</span></div>';
    html += '<div style="display:grid; grid-template-columns: 48px 60px 48px; gap: 4px; align-items: center;">';

    metrics.forEach(name => {
      const entry = vitalsStore[name];
      const val = entry ? (name === 'CLS' ? entry.value.toFixed(3) : Math.round(entry.value) + 'ms') : '—';
      const rating = entry ? entry.rating : 'pending';
      const color = rating === 'good' ? '#10b981' : rating === 'needs-improvement' ? '#f59e0b' : rating === 'poor' ? '#ef4444' : '#64748b';
      html += `<div>${name}</div><div style="font-weight:600; text-align:right;">${val}</div><div style="color:${color}; font-weight:700; text-align:center;">${rating.slice(0, 4).toUpperCase()}</div>`;
    });
    html += '</div>';
    overlay.innerHTML = html;

    const closeBtn = overlay.querySelector('#agy-vitals-close');
    if (closeBtn) {
      closeBtn.onclick = () => overlay.remove();
    }
  };

  document.body.appendChild(overlay);
  render();
  const interval = setInterval(render, 500);
  return () => clearInterval(interval);
}
