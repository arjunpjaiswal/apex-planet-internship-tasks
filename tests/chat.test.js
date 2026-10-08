import { describe, it, expect } from 'vitest';
import {
  visibleRange,
  highlight,
  searchMessages,
  isNearBottom,
  groupBySenderAndTime
} from '../src/chat.logic.js';

describe('Chat Logic', () => {
  describe('visibleRange', () => {
    it('calculates visible range at top, middle, and bottom', () => {
      // 100 items, container height 300px, itemHeight 60px => 5 visible per screen
      const top = visibleRange(0, 300, 60, 100, 2);
      expect(top.startIndex).toBe(0);
      expect(top.endIndex).toBe(7); // 0 + 5 + 2
      expect(top.offsetY).toBe(0);

      // Mid: scrollTop = 1200 => index 20
      const mid = visibleRange(1200, 300, 60, 100, 2);
      expect(mid.startIndex).toBe(18); // 20 - 2
      expect(mid.endIndex).toBe(27); // 20 + 5 + 2
      expect(mid.offsetY).toBe(18 * 60);

      // Bottom: scrollTop = 5700 => index 95
      const bot = visibleRange(5700, 300, 60, 100, 2);
      expect(bot.startIndex).toBe(93);
      expect(bot.endIndex).toBe(100); // capped at totalItems
    });
  });

  describe('highlight', () => {
    it('escapes HTML and regex, matching case-insensitively', () => {
      const raw = 'Click <b>here</b> for (100% off)';
      const query = '(100%';
      const res = highlight(raw, query);

      expect(res).not.toContain('<b>');
      expect(res).toContain('&lt;b&gt;');
      expect(res).toContain('<mark class="highlight">(100%</mark>');
    });
  });

  describe('searchMessages', () => {
    it('filters messages matching query in text or sender', () => {
      const list = [
        { id: 1, sender: 'Alice', text: 'Hello team' },
        { id: 2, sender: 'Bob', text: 'Good morning' },
        { id: 3, sender: 'Charlie', text: 'Alice did you check this?' }
      ];
      expect(searchMessages(list, 'alice')).toHaveLength(2);
      expect(searchMessages(list, 'morning')).toHaveLength(1);
    });
  });

  describe('isNearBottom', () => {
    it('determines if scroll position is close to bottom', () => {
      expect(isNearBottom(1900, 2000, 100, 50)).toBe(true);
      expect(isNearBottom(1500, 2000, 100, 50)).toBe(false);
    });
  });

  describe('groupBySenderAndTime', () => {
    it('groups contiguous messages from same sender within time window', () => {
      const messages = [
        { id: 1, sender: 'Alice', timestamp: '2026-01-01T10:00:00Z', text: 'Hi' },
        { id: 2, sender: 'Alice', timestamp: '2026-01-01T10:02:00Z', text: 'How are you?' },
        { id: 3, sender: 'Bob', timestamp: '2026-01-01T10:03:00Z', text: 'Hey Alice' },
        { id: 4, sender: 'Alice', timestamp: '2026-01-01T10:20:00Z', text: 'Back now' }
      ];

      const groups = groupBySenderAndTime(messages, 5);
      expect(groups).toHaveLength(3);
      expect(groups[0].messages).toHaveLength(2);
      expect(groups[1].sender).toBe('Bob');
      expect(groups[2].messages).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    it('handles empty message collections and queries', () => {
      expect(visibleRange(0, 300, 60, 0)).toEqual({ startIndex: 0, endIndex: 0, offsetY: 0 });
      expect(highlight('hello', '')).toBe('hello');
      expect(searchMessages([{ text: 'hi' }], '')).toHaveLength(1);
    });
  });
});
