import { describe, it, expect } from 'vitest';
import {
  totals,
  byCategory,
  byMonth,
  applyFilters,
  budgetStatus,
  generateRecurring,
  predictNext,
  toCSV,
  parseCSV
} from '../src/expense.logic.js';

describe('Expense Logic', () => {
  const sampleTransactions = [
    { id: '1', type: 'income', amount: 3000, category: 'Salary', date: '2026-01-01', note: 'Monthly pay' },
    { id: '2', type: 'expense', amount: 500, category: 'Food', date: '2026-01-05', note: 'Groceries' },
    { id: '3', type: 'expense', amount: 200, category: 'Utilities', date: '2026-01-10', note: 'Electric' },
    { id: '4', type: 'expense', amount: 300, category: 'Food', date: '2026-02-02', note: 'Dinner' }
  ];

  it('calculates totals accurately', () => {
    const res = totals(sampleTransactions);
    expect(res.income).toBe(3000);
    expect(res.expense).toBe(1000);
    expect(res.balance).toBe(2000);
  });

  it('calculates breakdown by category for expenses', () => {
    const cats = byCategory(sampleTransactions);
    expect(cats.Food).toBe(800);
    expect(cats.Utilities).toBe(200);
    expect(cats.Salary).toBeUndefined();
  });

  it('groups transactions by month', () => {
    const months = byMonth(sampleTransactions);
    expect(months['2026-01']).toEqual({ income: 3000, expense: 700, balance: 2300 });
    expect(months['2026-02']).toEqual({ income: 0, expense: 300, balance: -300 });
  });

  it('applies filters for date, category, and type', () => {
    const filtered = applyFilters(sampleTransactions, {
      startDate: '2026-01-02',
      endDate: '2026-01-15',
      category: 'Food',
      type: 'expense'
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('evaluates budget status thresholds (ok, warn, over)', () => {
    expect(budgetStatus(700, 1000)).toBe('ok');
    expect(budgetStatus(800, 1000)).toBe('warn');
    expect(budgetStatus(950, 1000)).toBe('warn');
    expect(budgetStatus(1000, 1000)).toBe('warn');
    expect(budgetStatus(1050, 1000)).toBe('over');
  });

  it('generates recurring transactions on load', () => {
    const configs = [
      { id: 'r1', type: 'expense', amount: 100, category: 'Subscription', note: 'Cloud', dayOfMonth: 5, lastGeneratedMonth: null }
    ];
    const generated = generateRecurring(configs, new Date('2026-03-15'));
    expect(generated).toHaveLength(1);
    expect(generated[0].amount).toBe(100);
    expect(generated[0].date).toBe('2026-03-05');
    expect(configs[0].lastGeneratedMonth).toBe('2026-03');

    // Second call in same month generates 0
    const secondPass = generateRecurring(configs, new Date('2026-03-20'));
    expect(secondPass).toHaveLength(0);
  });

  it('predicts next balance via linear regression', () => {
    // x = 0, 1, 2 => y = 1000, 2000, 3000 => next should be 4000
    const balances = [1000, 2000, 3000];
    const prediction = predictNext(balances);
    expect(prediction).toBe(4000);
  });

  it('performs CSV round-trip serialization and handles commas/quotes', () => {
    const data = [
      { id: '1', type: 'expense', amount: 45.5, category: 'Shopping', date: '2026-02-14', note: 'Gifts, candy, & "flowers"' }
    ];
    const csv = toCSV(data);
    expect(csv).toContain('"Gifts, candy, & ""flowers"""');

    const parsed = parseCSV(csv);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].amount).toBe(45.5);
    expect(parsed[0].note).toBe('Gifts, candy, & "flowers"');
  });

  it('handles edge cases in regression, budgets, and filters', () => {
    expect(predictNext([])).toBe(0);
    expect(predictNext([500])).toBe(500);

    expect(budgetStatus(500, 0)).toBe('ok');
    expect(budgetStatus(500, -50)).toBe('ok');

    expect(totals()).toEqual({ income: 0, expense: 0, balance: 0 });
    expect(byCategory()).toEqual({});
    expect(byMonth([{ date: 'invalid' }])).toEqual({});

    expect(parseCSV('')).toEqual([]);
    expect(parseCSV('header\n')).toEqual([]);

    const noFilters = applyFilters(sampleTransactions);
    expect(noFilters).toHaveLength(4);

    const typeOnly = applyFilters(sampleTransactions, { type: 'income' });
    expect(typeOnly).toHaveLength(1);

    const startOnly = applyFilters(sampleTransactions, { startDate: '2026-02-01' });
    expect(startOnly).toHaveLength(1);

    const endOnly = applyFilters(sampleTransactions, { endDate: '2026-01-05' });
    expect(endOnly).toHaveLength(2);
  });
});
