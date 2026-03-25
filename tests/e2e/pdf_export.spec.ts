import { test, expect } from '@playwright/test';

test.describe('PDF Export Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wizard');
  });

  test('PDF download button is visible on final step', async ({ page }) => {
    await page.click('button:has-text("Hourly")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');

    const downloadButton = page.getByRole('button', { name: /Download PDF/i });
    await expect(downloadButton).toBeVisible();
  });

  test('user can download PDF from final wizard step', async ({ page }) => {
    await page.route('**/api/v1/export-pdf*', async (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: Buffer.from('%PDF-1.4 mock pdf content'),
        headers: {
          'Content-Disposition': 'attachment; filename="Becslo_Quote_test.pdf"',
        },
      });
    });

    await page.click('button:has-text("Hourly")');
    for (let i = 0; i < 6; i++) {
      await page.click('button:has-text("Next Step")');
    }

    const downloadButton = page.getByRole('button', { name: /Download PDF/i });
    const downloadPromise = page.waitForEvent('download');
    
    await downloadButton.click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('PDF download shows loading state', async ({ page }) => {
    let isLoading = true;
    await page.route('**/api/v1/export-pdf*', async (route) => {
      if (isLoading) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        isLoading = false;
      }
      route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: Buffer.from('%PDF-1.4 mock pdf content'),
      });
    });

    await page.click('button:has-text("Hourly")');
    for (let i = 0; i < 6; i++) {
      await page.click('button:has-text("Next Step")');
    }

    const downloadButton = page.getByRole('button', { name: /Download PDF/i });
    await downloadButton.click();
    
    await expect(page.getByText(/Generating\.\.\./i)).toBeVisible();
    await expect(downloadButton).toBeDisabled();
  });

  test('PDF download handles network error gracefully', async ({ page }) => {
    let errorCount = 0;
    await page.route('**/api/v1/export-pdf*', async (route) => {
      errorCount++;
      route.fulfill({
        status: errorCount < 2 ? 500 : 200,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.click('button:has-text("Hourly")');
    for (let i = 0; i < 6; i++) {
      await page.click('button:has-text("Next Step")');
    }

    const downloadButton = page.getByRole('button', { name: /Download PDF/i });
    await downloadButton.click();
    
    await expect(page.getByText(/Failed to generate PDF/i)).toBeVisible();
  });

  test('PDF download button becomes re-enabled after error', async ({ page }) => {
    await page.route('**/api/v1/export-pdf*', async (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.click('button:has-text("Hourly")');
    for (let i = 0; i < 6; i++) {
      await page.click('button:has-text("Next Step")');
    }

    const downloadButton = page.getByRole('button', { name: /Download PDF/i });
    await downloadButton.click();
    
    await page.waitForTimeout(2000);
    await expect(downloadButton).not.toBeDisabled();
  });

  test('error message can be dismissed', async ({ page }) => {
    await page.route('**/api/v1/export-pdf*', async (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.click('button:has-text("Hourly")');
    for (let i = 0; i < 6; i++) {
      await page.click('button:has-text("Next Step")');
    }

    const downloadButton = page.getByRole('button', { name: /Download PDF/i });
    await downloadButton.click();
    
    const errorMessage = page.getByText(/Failed to generate PDF/i);
    await expect(errorMessage).toBeVisible();
    
    const dismissButton = errorMessage.locator('..').getByRole('button');
    await dismissButton.click();
    
    await expect(errorMessage).not.toBeVisible();
  });

  test('PDF download generates correct filename format', async ({ page }) => {
    await page.route('**/api/v1/export-pdf*', async (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: Buffer.from('%PDF-1.4 mock pdf content'),
        headers: {
          'Content-Disposition': 'attachment; filename="Becslo_Quote_abc12345.pdf"',
        },
      });
    });

    await page.click('button:has-text("Hourly")');
    for (let i = 0; i < 6; i++) {
      await page.click('button:has-text("Next Step")');
    }

    const downloadButton = page.getByRole('button', { name: /Download PDF/i });
    const downloadPromise = page.waitForEvent('download');
    
    await downloadButton.click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/^Becslo_Quote_[a-z0-9]+\.pdf$/);
  });

  test('PDF download requires wizard to be completed', async ({ page }) => {
    const downloadButton = page.getByRole('button', { name: /Download PDF/i });
    await expect(downloadButton).not.toBeVisible();
  });
});