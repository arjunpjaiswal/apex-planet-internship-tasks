/**
 * Client Analytics Event Tracker
 * Queues events into LocalStorage and flushes periodically or on page unload
 */

const STORAGE_KEY = 'apexplanet_analytics_queue';
const SESSION_KEY = 'apexplanet_session_id';
const MAX_QUEUE_SIZE = 100;

function getSessionId() {
  if (typeof window === 'undefined' || !window.sessionStorage) return 'ssr-session';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'sess_' + Math.random().toString(36).substring(2, 11);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getQueue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('[Analytics] Failed to save queue:', err);
  }
}

export function track(eventName, properties = {}) {
  const event = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'evt_' + Math.random().toString(36).substring(2, 11),
    event: eventName,
    properties,
    sessionId: getSessionId(),
    timestamp: Date.now(),
    path: typeof window !== 'undefined' ? window.location.pathname : '/'
  };

  let queue = getQueue();
  queue.push(event);

  if (queue.length > MAX_QUEUE_SIZE) {
    queue = queue.slice(queue.length - MAX_QUEUE_SIZE);
  }

  saveQueue(queue);
  return event;
}

export function flushQueue() {
  const queue = getQueue();
  if (!queue.length) return 0;
  
  // In production, would send to analytics ingest endpoint
  const flushedCount = queue.length;
  saveQueue([]);
  return flushedCount;
}

export function getPendingEventsCount() {
  return getQueue().length;
}

// Flush setup
if (typeof window !== 'undefined') {
  setInterval(flushQueue, 30000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushQueue();
    }
  });
}
