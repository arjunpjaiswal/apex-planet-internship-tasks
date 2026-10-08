import { describe, it, expect, vi } from 'vitest';
import { createStore, combineReducers } from '../src/store.js';

describe('Redux-like Store', () => {
  function counterReducer(state = { count: 0 }, action) {
    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: state.count + 1 };
      case 'DECREMENT':
        return { ...state, count: state.count - 1 };
      case 'SET':
        return { ...state, count: action.payload };
      default:
        return state;
    }
  }

  it('initializes and returns state', () => {
    const store = createStore(counterReducer);
    expect(store.getState()).toEqual({ count: 0 });
  });

  it('dispatches actions and updates state', () => {
    const store = createStore(counterReducer);
    store.dispatch({ type: 'INCREMENT' });
    expect(store.getState().count).toBe(1);
    store.dispatch({ type: 'SET', payload: 42 });
    expect(store.getState().count).toBe(42);
  });

  it('handles subscribers and unsubscribe', () => {
    const store = createStore(counterReducer);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.dispatch({ type: 'INCREMENT' });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.dispatch({ type: 'INCREMENT' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('supports thunk middleware actions', async () => {
    const store = createStore(counterReducer);

    const asyncIncrement = (amount) => (dispatch, _getState) => {
      dispatch({ type: 'SET', payload: amount });
    };

    store.dispatch(asyncIncrement(99));
    expect(store.getState().count).toBe(99);
  });

  it('combines multiple reducers', () => {
    const rootReducer = combineReducers({
      counter: counterReducer,
      auth: (state = { user: null }, action) => {
        if (action.type === 'LOGIN') return { user: action.payload };
        return state;
      }
    });

    const store = createStore(rootReducer);
    expect(store.getState()).toEqual({
      counter: { count: 0 },
      auth: { user: null }
    });

    store.dispatch({ type: 'INCREMENT' });
    store.dispatch({ type: 'LOGIN', payload: 'Alice' });

    expect(store.getState()).toEqual({
      counter: { count: 1 },
      auth: { user: 'Alice' }
    });
  });

  it('validates listener and action types', () => {
    const store = createStore(counterReducer);

    expect(() => store.subscribe(null)).toThrow('Expected listener to be a function.');
    expect(() => store.dispatch('INVALID_STRING')).toThrow('Actions must be plain objects');

    // Enhancer support
    const mockEnhancer = (create) => (reducer, state) => {
      const s = create(reducer, state);
      return { ...s, enhanced: true };
    };
    const enhancedStore = createStore(counterReducer, mockEnhancer);
    expect(enhancedStore.enhanced).toBe(true);
  });
});
