import { test, expect } from '@playwright/test';

test.describe('Task 1: Kanban Board E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks/task1-kanban.html');
  });

  test('creates a new card and displays it in To Do column', async ({ page }) => {
    // Open Add Card modal
    await page.click('#add-card-btn');
    await expect(page.locator('#card-dialog')).toBeVisible();

    // Fill form
    await page.fill('#card-title', 'E2E Automated Task');
    await page.fill('#card-desc', 'Automated test card for Playwright verification');
    await page.selectOption('#card-priority', 'high');
    await page.click('#card-save-btn');

    // Verify card exists in To Do column
    const card = page.locator('.kanban-card', { hasText: 'E2E Automated Task' });
    await expect(card).toBeVisible();
    await expect(card.locator('.priority-badge')).toHaveText('high');
  });

  test('performs undo action to restore previous state', async ({ page }) => {
    // Add card
    await page.click('#add-card-btn');
    await page.fill('#card-title', 'Temporary Task');
    await page.click('#card-save-btn');
    await expect(page.locator('.kanban-card', { hasText: 'Temporary Task' })).toBeVisible();

    // Click Undo button
    await page.click('#undo-btn');

    // Verify card is undone
    await expect(page.locator('.kanban-card', { hasText: 'Temporary Task' })).not.toBeVisible();
  });

  test('persists cards across page reload', async ({ page }) => {
    await page.click('#add-card-btn');
    await page.fill('#card-title', 'Persistent Task');
    await page.click('#card-save-btn');
    await expect(page.locator('.kanban-card', { hasText: 'Persistent Task' })).toBeVisible();

    // Reload page
    await page.reload();

    // Verify card still exists
    await expect(page.locator('.kanban-card', { hasText: 'Persistent Task' })).toBeVisible();
  });
});
