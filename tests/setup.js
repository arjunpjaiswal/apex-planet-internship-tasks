import { beforeEach } from 'vitest';

// Polyfill crypto.randomUUID if not in jsdom
if (!globalThis.crypto) {
  globalThis.crypto = {};
}
if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = () => 'uuid-' + Math.random().toString(36).substring(2, 10);
}

// Polyfill requestAnimationFrame
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 16);
}
if (!globalThis.cancelAnimationFrame) {
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}

// Polyfill performance.now
if (!globalThis.performance) {
  globalThis.performance = { now: () => Date.now() };
} else if (!globalThis.performance.now) {
  globalThis.performance.now = () => Date.now();
}

// Mock Storage
class MemoryStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
  get length() {
    return Object.keys(this.store).length;
  }
  key(index) {
    return Object.keys(this.store)[index] || null;
  }
}

if (!globalThis.localStorage) {
  globalThis.localStorage = new MemoryStorage();
}
if (!globalThis.sessionStorage) {
  globalThis.sessionStorage = new MemoryStorage();
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
