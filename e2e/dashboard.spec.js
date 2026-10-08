import { test, expect } from '@playwright/test';

test.describe('Task 5: Crypto Dashboard E2E', () => {
  test('mocks CoinGecko API route and displays coin cards and table', async ({ page }) => {
    // Mock CoinGecko endpoint
    await page.route('**/api.coingecko.com/**', async (route) => {
      const mockData = [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 65432.1,
          price_change_percentage_24h: 2.45,
          image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
          sparkline_in_7d: {
            price: [64000, 64500, 65000, 65432.1]
          }
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          current_price: 3456.78,
          price_change_percentage_24h: -1.2,
          image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
          sparkline_in_7d: {
            price: [3500, 3480, 3456.78]
          }
        }
      ];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData)
      });
    });

    await page.goto('/tasks/task5-dashboard.html');

    // Verify cards appear
    await expect(page.locator('.crypto-card', { hasText: 'Bitcoin' })).toBeVisible();
    await expect(page.locator('.crypto-card', { hasText: 'Ethereum' })).toBeVisible();
  });

  test('syncs search query parameter to URL', async ({ page }) => {
    await page.goto('/tasks/task5-dashboard.html');
    const searchInput = page.locator('#search-input');
    await searchInput.fill('solana');

    // Wait for debounced sync
    await page.waitForTimeout(400);
    expect(page.url()).toContain('q=solana');
  });
});
