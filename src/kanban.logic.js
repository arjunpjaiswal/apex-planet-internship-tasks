/**
 * Pure Kanban Board Logic
 */

export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'card_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

export function createInitialBoard() {
  return {
    columns: [
      { id: 'todo', title: 'To Do', cards: [] },
      { id: 'in-progress', title: 'In Progress', cards: [] },
      { id: 'done', title: 'Done', cards: [] }
    ]
  };
}

export function addCard(board, columnId, cardData) {
  const newCard = {
    id: cardData.id || uid(),
    title: cardData.title || 'Untitled Card',
    description: cardData.description || '',
    priority: cardData.priority || 'medium', // low, medium, high
    createdAt: cardData.createdAt || Date.now()
  };

  return {
    ...board,
    columns: board.columns.map(col => {
      if (col.id === columnId) {
        return {
          ...col,
          cards: [...col.cards, newCard]
        };
      }
      return col;
    })
  };
}

export function updateCard(board, cardId, updates) {
  return {
    ...board,
    columns: board.columns.map(col => ({
      ...col,
      cards: col.cards.map(c => c.id === cardId ? { ...c, ...updates, updatedAt: Date.now() } : c)
    }))
  };
}

export function deleteCard(board, cardId) {
  return {
    ...board,
    columns: board.columns.map(col => ({
      ...col,
      cards: col.cards.filter(c => c.id !== cardId)
    }))
  };
}

export function moveCard(board, cardId, targetColumnId, targetIndex = null) {
  let movingCard = null;

  // First extract card
  const newColumnsWithoutCard = board.columns.map(col => {
    const found = col.cards.find(c => c.id === cardId);
    if (found) {
      movingCard = { ...found };
      return {
        ...col,
        cards: col.cards.filter(c => c.id !== cardId)
      };
    }
    return col;
  });

  if (!movingCard) return board;

  // Insert into target column
  return {
    ...board,
    columns: newColumnsWithoutCard.map(col => {
      if (col.id === targetColumnId) {
        const updatedCards = [...col.cards];
        if (targetIndex === null || targetIndex === undefined || targetIndex >= updatedCards.length) {
          updatedCards.push(movingCard);
        } else {
          updatedCards.splice(Math.max(0, targetIndex), 0, movingCard);
        }
        return {
          ...col,
          cards: updatedCards
        };
      }
      return col;
    })
  };
}

export function filterCards(cards, { search = '', priority = 'all' } = {}) {
  const q = (search || '').trim().toLowerCase();
  const p = (priority || 'all').toLowerCase();

  return cards.filter(card => {
    const matchesSearch = !q ||
      card.title.toLowerCase().includes(q) ||
      (card.description && card.description.toLowerCase().includes(q));
    const matchesPriority = p === 'all' || card.priority.toLowerCase() === p;
    return matchesSearch && matchesPriority;
  });
}

export function createHistoryStack(initialState, max = 50) {
  let past = [];
  let present = JSON.parse(JSON.stringify(initialState));
  let future = [];

  return {
    push(newState) {
      past.push(JSON.parse(JSON.stringify(present)));
      if (past.length > max) {
        past.shift();
      }
      present = JSON.parse(JSON.stringify(newState));
      future = [];
    },
    undo() {
      if (!this.canUndo()) return null;
      future.unshift(JSON.parse(JSON.stringify(present)));
      present = past.pop();
      return JSON.parse(JSON.stringify(present));
    },
    redo() {
      if (!this.canRedo()) return null;
      past.push(JSON.parse(JSON.stringify(present)));
      present = future.shift();
      return JSON.parse(JSON.stringify(present));
    },
    canUndo() {
      return past.length > 0;
    },
    canRedo() {
      return future.length > 0;
    },
    getState() {
      return JSON.parse(JSON.stringify(present));
    },
    getHistory() {
      return {
        pastLength: past.length,
        futureLength: future.length,
        max
      };
    }
  };
}
