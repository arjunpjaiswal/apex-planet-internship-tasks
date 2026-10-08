import './StatCard.css';

export function createStatCard({
  label = 'Total Revenue',
  value = '$128,450',
  delta = '+12.4% vs last month',
  isPositive = true,
  icon = '💰'
} = {}) {
  const card = document.createElement('div');
  card.className = 'stat-card';

  card.innerHTML = `
    <div class="stat-card-info">
      <span class="stat-card-label">${label}</span>
      <span class="stat-card-value">${value}</span>
      <span class="stat-card-delta ${isPositive ? 'positive' : 'negative'}">${delta}</span>
    </div>
    <div class="stat-card-icon-wrap">${icon}</div>
  `;

  return card;
}
