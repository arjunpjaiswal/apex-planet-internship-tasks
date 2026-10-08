/**
 * Custom Redux-like Store with Thunk Middleware & Reducer Combiner
 */

export function createStore(reducer, preloadedState, enhancer) {
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer === 'function') {
    return enhancer(createStore)(reducer, preloadedState);
  }

  let state = preloadedState !== undefined ? preloadedState : reducer(undefined, { type: '@@INIT' });
  let listeners = [];
  let isDispatching = false;

  function getState() {
    return state;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }
    listeners.push(listener);
    return function unsubscribe() {
      listeners = listeners.filter(l => l !== listener);
    };
  }

  function dispatch(action) {
    if (typeof action === 'function') {
      // Thunk action support
      return action(dispatch, getState);
    }

    if (typeof action !== 'object' || action === null || typeof action.type === 'undefined') {
      throw new Error('Actions must be plain objects with a type property.');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      state = reducer(state, action);
    } finally {
      isDispatching = false;
    }

    listeners.forEach(listener => listener());
    return action;
  }

  return {
    getState,
    dispatch,
    subscribe
  };
}

export function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);

  return function combination(state = {}, action) {
    let hasChanged = false;
    const nextState = {};

    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i];
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? nextState : state;
  };
}
