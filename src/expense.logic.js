/**
 * Pure Expense Tracker Logic
 */

export function totals(transactions = []) {
  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    const val = Number(t.amount) || 0;
    if (t.type === 'income') {
      income += val;
    } else if (t.type === 'expense') {
      expense += val;
    }
  }

  return {
    income,
    expense,
    balance: income - expense
  };
}

export function byCategory(transactions = []) {
  const result = {};
  for (const t of transactions) {
    if (t.type === 'expense') {
      const cat = t.category || 'Uncategorized';
      result[cat] = (result[cat] || 0) + (Number(t.amount) || 0);
    }
  }
  return result;
}

export function byMonth(transactions = []) {
  const months = {};

  for (const t of transactions) {
    const d = new Date(t.date);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (!months[key]) {
      months[key] = { income: 0, expense: 0, balance: 0 };
    }

    const val = Number(t.amount) || 0;
    if (t.type === 'income') {
      months[key].income += val;
      months[key].balance += val;
    } else if (t.type === 'expense') {
      months[key].expense += val;
      months[key].balance -= val;
    }
  }

  // Return sorted alphabetically by key (chronological YYYY-MM)
  const sorted = {};
  Object.keys(months).sort().forEach(k => {
    sorted[k] = months[k];
  });
  return sorted;
}

export function applyFilters(transactions = [], { startDate, endDate, category, type } = {}) {
  return transactions.filter(t => {
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    if (category && category !== 'all' && t.category !== category) return false;
    if (type && type !== 'all' && t.type !== type) return false;
    return true;
  });
}

export function budgetStatus(actual, limit) {
  if (!limit || limit <= 0) return 'ok';
  const ratio = actual / limit;
  if (ratio > 1.0) return 'over';
  if (ratio >= 0.8) return 'warn';
  return 'ok';
}

export function generateRecurring(recurringConfigs = [], currentDate = new Date()) {
  const now = new Date(currentDate);
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const generated = [];

  for (const item of recurringConfigs) {
    if (item.lastGeneratedMonth !== currentYearMonth) {
      const day = String(item.dayOfMonth || 1).padStart(2, '0');
      generated.push({
        id: 'rec_' + Math.random().toString(36).substring(2, 9),
        type: item.type,
        amount: Number(item.amount),
        category: item.category,
        note: `[Recurring] ${item.note || ''}`.trim(),
        date: `${currentYearMonth}-${day}`,
        isRecurringInstance: true
      });
      item.lastGeneratedMonth = currentYearMonth;
    }
  }

  return generated;
}

export function predictNext(monthlyBalances = []) {
  const n = monthlyBalances.length;
  if (n === 0) return 0;
  if (n === 1) return monthlyBalances[0];

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = monthlyBalances[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = (n * sumXX) - (sumX * sumX);
  if (denominator === 0) return monthlyBalances[n - 1];

  const slope = ((n * sumXY) - (sumX * sumY)) / denominator;
  const intercept = (sumY - (slope * sumX)) / n;

  // Next point is at x = n
  return Math.round((slope * n + intercept) * 100) / 100;
}

function escapeCsvField(field) {
  const str = String(field ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCSV(transactions = []) {
  const headers = ['id', 'type', 'amount', 'category', 'date', 'note'];
  const rows = transactions.map(t => [
    escapeCsvField(t.id),
    escapeCsvField(t.type),
    escapeCsvField(t.amount),
    escapeCsvField(t.category),
    escapeCsvField(t.date),
    escapeCsvField(t.note)
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

export function parseCSV(csvText = '') {
  if (!csvText.trim()) return [];

  const lines = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && csvText[i + 1] === '\n') {
        i++;
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  const parseRow = (line) => {
    const fields = [];
    let field = '';
    let insideQuote = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (insideQuote && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (c === ',' && !insideQuote) {
        fields.push(field);
        field = '';
      } else {
        field += c;
      }
    }
    fields.push(field);
    return fields;
  };

  const headers = parseRow(lines[0]).map(h => h.trim().toLowerCase());
  const transactions = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseRow(lines[i]);
    const obj = {};
    headers.forEach((h, index) => {
      obj[h] = fields[index] ?? '';
    });

    if (obj.amount && !isNaN(Number(obj.amount))) {
      transactions.push({
        id: obj.id || ('txn_' + Math.random().toString(36).substring(2, 9)),
        type: obj.type === 'income' ? 'income' : 'expense',
        amount: Number(obj.amount),
        category: obj.category || 'General',
        date: obj.date || new Date().toISOString().split('T')[0],
        note: obj.note || ''
      });
    }
  }

  return transactions;
}
