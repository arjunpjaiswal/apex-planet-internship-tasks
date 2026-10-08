import './CoinCard.css';

export function createCoinCard({
  name = 'Bitcoin',
  symbol = 'BTC',
  price = '$68,420.00',
  change24h = '+3.45%',
  isPositive = true,
  icon = 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  sparkline = [62000, 63400, 62800, 64200, 66100, 65800, 68420]
} = {}) {
  const card = document.createElement('div');
  card.className = 'coin-card';

  card.innerHTML = `
    <div class="coin-card-header">
      <img src="${icon}" alt="${name}" class="coin-card-icon" />
      <div class="coin-card-meta">
        <span class="coin-card-name">${name}</span>
        <span class="coin-card-symbol">${symbol}</span>
      </div>
    </div>
    <div class="coin-card-price-row">
      <span class="coin-card-price">${price}</span>
      <span class="coin-card-change ${isPositive ? 'up' : 'down'}">${change24h}</span>
    </div>
    <canvas class="coin-card-chart" width="208" height="48"></canvas>
  `;

  const canvas = card.querySelector('.coin-card-chart');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = (max - min) || 1;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = isPositive ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;

    sparkline.forEach((val, i) => {
      const x = (i / (sparkline.length - 1)) * w;
      const y = h - ((val - min) / range) * (h - 8) - 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  return card;
}
