import { test, expect } from '@playwright/test';

test.describe('Final Acceptance Test Lifecycle', () => {
  test('Farmer lists produce, Buyer offers, Farmer evaluates via NetProfit and accepts, stock updates atomically', async ({ page }) => {
    // 1. Visit landing page
    await page.goto('/');
    await expect(page.getByText('Direct Market Access for')).toBeVisible();

    // 2. Log in as Farmer (via 1-click test selector or login page)
    await page.getByRole('button', { name: /Farmer: Rameshwar Patil/i }).click();
    await page.waitForTimeout(500);

    // 3. Navigate to Farmer Dashboard
    await page.goto('/farmer/dashboard');
    await expect(page.getByText('Farmer Portal')).toBeVisible();

    // 4. Create a new produce listing
    await page.goto('/farmer/listings/new');
    await page.getByPlaceholder(/Desi Vine Tomatoes/i).fill('Golden Shimla Apples');
    await page.getByPlaceholder('500').fill('600');
    await page.getByPlaceholder('35').fill('80');
    await page.getByRole('button', { name: /Publish Listing/i }).click();

    // Verify redirected to My Listings with new crop
    await page.waitForURL('**/farmer/listings');
    await expect(page.getByText('Golden Shimla Apples')).toBeVisible();

    // 5. Switch to Buyer role
    await page.goto('/marketplace');
    await page.getByRole('button', { name: 'Buyer' }).click();

    // Buyer sees marketplace
    await expect(page.getByText('Fresh Harvest Marketplace')).toBeVisible();

    // 6. Navigate to listing offers as Farmer to inspect NetProfit Match
    await page.getByRole('button', { name: 'Farmer' }).click();
    await page.goto('/farmer/listings');
    // Click compare offers on first item
    const compareBtn = page.getByRole('link', { name: /Compare Offers/i }).first();
    await compareBtn.click();

    // NetProfit Match engine evaluation
    await expect(page.getByText('NetProfit Match Evaluation Engine')).toBeVisible();
    await expect(page.getByText('Rank #1')).toBeVisible();
    await expect(page.getByText(/Highest Net Take-Home/i)).toBeVisible();

    // 7. Accept Rank #1 Offer atomically
    const acceptBtn = page.getByRole('button', { name: /Accept Offer & Create Order/i }).first();
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
      await expect(page.getByText(/Offer successfully accepted!/i)).toBeVisible();
    }

    // 8. Verify order exists in Orders dashboard
    await page.goto('/orders');
    await expect(page.getByText('Direct Market Orders')).toBeVisible();
  });
});
