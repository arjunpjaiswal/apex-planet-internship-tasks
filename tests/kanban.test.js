import { describe, it, expect } from 'vitest';
import {
  uid,
  createInitialBoard,
  addCard,
  updateCard,
  deleteCard,
  moveCard,
  filterCards,
  createHistoryStack
} from '../src/kanban.logic.js';

describe('Kanban Logic', () => {
  it('generates unique IDs', () => {
    const id1 = uid();
    const id2 = uid();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
  });

  it('adds a card to the specified column', () => {
    const board = createInitialBoard();
    const updated = addCard(board, 'todo', {
      title: 'Task A',
      description: 'Description A',
      priority: 'high'
    });

    const todoCol = updated.columns.find(c => c.id === 'todo');
    expect(todoCol.cards).toHaveLength(1);
    expect(todoCol.cards[0].title).toBe('Task A');
    expect(todoCol.cards[0].priority).toBe('high');
    expect(todoCol.cards[0].id).toBeDefined();
  });

  it('updates an existing card', () => {
    const board = createInitialBoard();
    const b1 = addCard(board, 'todo', { id: 'c1', title: 'Original' });
    const b2 = updateCard(b1, 'c1', { title: 'Updated Title', priority: 'low' });

    const card = b2.columns.find(c => c.id === 'todo').cards.find(c => c.id === 'c1');
    expect(card.title).toBe('Updated Title');
    expect(card.priority).toBe('low');
  });

  it('deletes a card', () => {
    const board = createInitialBoard();
    const b1 = addCard(board, 'todo', { id: 'c1', title: 'To Delete' });
    const b2 = deleteCard(b1, 'c1');

    const todoCards = b2.columns.find(c => c.id === 'todo').cards;
    expect(todoCards).toHaveLength(0);
  });

  it('moves a card between columns and specific indices', () => {
    const board = createInitialBoard();
    const b1 = addCard(board, 'todo', { id: 'c1', title: 'Task 1' });
    const b2 = addCard(b1, 'in-progress', { id: 'c2', title: 'Task 2' });

    // Move c1 from 'todo' to 'in-progress' at index 0
    const b3 = moveCard(b2, 'c1', 'in-progress', 0);
    const inProgress = b3.columns.find(c => c.id === 'in-progress');
    const todo = b3.columns.find(c => c.id === 'todo');

    expect(todo.cards).toHaveLength(0);
    expect(inProgress.cards).toHaveLength(2);
    expect(inProgress.cards[0].id).toBe('c1');
    expect(inProgress.cards[1].id).toBe('c2');
  });

  it('filters cards by search and priority', () => {
    const cards = [
      { id: '1', title: 'Refactor Auth', description: 'JWT tokens', priority: 'high' },
      { id: '2', title: 'Fix CSS Bug', description: 'Grid overflow', priority: 'medium' },
      { id: '3', title: 'Write Tests', description: 'Unit tests', priority: 'high' }
    ];

    const searchFiltered = filterCards(cards, { search: 'css' });
    expect(searchFiltered).toHaveLength(1);
    expect(searchFiltered[0].id).toBe('2');

    const priorityFiltered = filterCards(cards, { priority: 'high' });
    expect(priorityFiltered).toHaveLength(2);

    const combined = filterCards(cards, { search: 'auth', priority: 'high' });
    expect(combined).toHaveLength(1);
    expect(combined[0].id).toBe('1');
  });

  describe('History Stack (Undo / Redo)', () => {
    it('manages undo and redo correctly within limits', () => {
      const history = createHistoryStack({ step: 0 }, 3);

      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);

      history.push({ step: 1 });
      history.push({ step: 2 });
      history.push({ step: 3 });
      history.push({ step: 4 }); // pushes past max 3

      expect(history.getState()).toEqual({ step: 4 });
      expect(history.canUndo()).toBe(true);

      const undo1 = history.undo();
      expect(undo1).toEqual({ step: 3 });
      expect(history.canRedo()).toBe(true);

      const redo1 = history.redo();
      expect(redo1).toEqual({ step: 4 });
      expect(history.canRedo()).toBe(false);

      expect(history.getHistory()).toEqual({ pastLength: 3, futureLength: 0, max: 3 });

      const freshHistory = createHistoryStack({ step: 0 });
      expect(freshHistory.undo()).toBeNull();
      expect(freshHistory.redo()).toBeNull();
    });

    it('handles moving non-existent card gracefully', () => {
      const board = createInitialBoard();
      const unchanged = moveCard(board, 'non-existent-id', 'done', 0);
      expect(unchanged).toEqual(board);
    });
  });
});
