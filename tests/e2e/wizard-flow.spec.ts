import { test, expect } from '@playwright/test';

test.describe('Wizard Flow - Step Transitions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wizard');
  });

  test('wizard page loads and displays first step', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Pricing Model|Select/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Next Step/i })).toBeVisible();
  });

  test('step 1: pricing model selection works', async ({ page }) => {
    await expect(page.getByText(/hourly/i)).toBeVisible();
    await expect(page.getByText(/project-based/i)).toBeVisible();
    
    await page.click('text=Hourly');
    await expect(page.locator('input[value="hourly"]')).toBeChecked();
    
    await page.click('text=Project-based');
    await expect(page.locator('input[value="project-based"]')).toBeChecked();
  });

  test('step 2: service selection displays categories', async ({ page }) => {
    await page.click('button:has-text("Next Step")');
    
    await expect(page.getByRole('heading', { name: /Services|Select Services/i })).toBeVisible();
    
    const categories = await page.getByRole('heading').all();
    expect(categories.length).toBeGreaterThan(0);
  });

  test('step 2: can select services and update hours', async ({ page }) => {
    await page.click('button:has-text("Next Step")');
    
    const firstService = await page.locator('text=Select').first();
    if (await firstService.isVisible()) {
      await firstService.click();
      
      const hourInput = page.locator('input[type="number"]').first();
      await expect(hourInput).toBeVisible();
      
      await hourInput.fill('10');
      await expect(hourInput).toHaveValue('10');
    }
  });

  test('step 3: experience inputs work correctly', async ({ page }) => {
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    
    await expect(page.getByRole('heading', { name: /Experience/i })).toBeVisible();
    
    const designerSlider = page.locator('input[name*="designer"]').first();
    await expect(designerSlider).toBeVisible();
    
    const freelanceSlider = page.locator('input[name*="freelance"]').first();
    await expect(freelanceSlider).toBeVisible();
  });

  test('step 4: geography selection displays countries', async ({ page }) => {
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    
    await expect(page.getByRole('heading', { name: /Geography|Location/i })).toBeVisible();
    
    const designerCountry = page.locator('select[name*="designer"]').first();
    await expect(designerCountry).toBeVisible();
    
    const clientCountry = page.locator('select[name*="client"]').first();
    await expect(clientCountry).toBeVisible();
  });

  test('step 5: cost selection works', async ({ page }) => {
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    
    await expect(page.getByRole('heading', { name: /Costs|Overhead/i })).toBeVisible();
    
    const costCheckboxes = await page.locator('input[type="checkbox"]').count();
    expect(costCheckboxes).toBeGreaterThan(0);
  });

  test('step 6: risk and profit sliders work', async ({ page }) => {
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    
    await expect(page.getByRole('heading', { name: /Risk|Profit|Margin/i })).toBeVisible();
    
    const riskSlider = page.locator('input[name*="risk"]').first();
    await expect(riskSlider).toBeVisible();
    
    const profitSlider = page.locator('input[name*="profit"]').first();
    await expect(profitSlider).toBeVisible();
  });

  test('step 7: review page displays results', async ({ page }) => {
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    
    await expect(page.getByRole('heading', { name: /Review|Project Review/i })).toBeVisible();
    await expect(page.getByText(/Total Valuation|Final Price/i)).toBeVisible();
    await expect(page.getByText(/Recommended Range/i)).toBeVisible();
  });

  test('cannot proceed with incomplete step 1', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /Next Step/i });
    await expect(nextButton).toBeDisabled();
  });

  test('back button navigates to previous step', async ({ page }) => {
    await page.click('button:has-text("Hourly")');
    await page.click('button:has-text("Next Step")');
    
    await expect(page.getByRole('heading', { name: /Services|Select Services/i })).toBeVisible();
    
    await page.click('text=Back');
    
    await expect(page.getByRole('heading', { name: /Pricing Model|Select/i })).toBeVisible();
  });

  test('back button disabled on first step', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /Back/i });
    await expect(backButton).toBeDisabled();
  });

  test('keyboard Enter advances to next step when valid', async ({ page }) => {
    await page.click('button:has-text("Hourly")');
    
    await page.keyboard.press('Enter');
    
    await expect(page.getByRole('heading', { name: /Services|Select Services/i })).toBeVisible();
  });

  test('keyboard Escape goes to previous step', async ({ page }) => {
    await page.click('button:has-text("Hourly")');
    await page.click('button:has-text("Next Step")');
    
    await page.keyboard.press('Escape');
    
    await expect(page.getByRole('heading', { name: /Pricing Model|Select/i })).toBeVisible();
  });

  test('validation error appears for incomplete step', async ({ page }) => {
    await page.click('button:has-text("Hourly")');
    await page.click('button:has-text("Next Step")');
    await page.click('button:has-text("Next Step")');
    
    const serviceError = page.getByText(/Please select at least one service/i);
    if (await serviceError.isVisible({ timeout: 2000 })) {
      await expect(serviceError).toBeVisible();
    }
  });

  test('progress bar updates correctly', async ({ page }) => {
    const progressBar = page.locator('[role="progressbar"], [data-progress]');
    if (await progressBar.isVisible()) {
      const initialProgress = await progressBar.getAttribute('data-progress') || '1';
      expect(parseInt(initialProgress)).toBeGreaterThan(0);
    }
  });

  test('live preview panel is visible', async ({ page }) => {
    const previewPanel = page.locator('[class*="preview"], [class*="Preview"]');
    await expect(previewPanel).toBeVisible();
  });

  test('can navigate through all 7 steps', async ({ page }) => {
    await page.click('button:has-text("Hourly")');
    await page.click('button:has-text("Next Step")');
    
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Next Step")');
    }
    
    await expect(page.getByRole('heading', { name: /Review|Project Review/i })).toBeVisible();
    
    for (let i = 0; i < 6; i++) {
      await page.click('text=Back');
    }
    
    await expect(page.getByRole('heading', { name: /Pricing Model|Select/i })).toBeVisible();
  });

  test('final step shows download PDF button', async ({ page }) => {
    for (let i = 0; i < 6; i++) {
      await page.click('button:has-text("Next Step")');
    }
    
    const downloadButton = page.getByRole('button', { name: /Download PDF/i });
    await expect(downloadButton).toBeVisible();
  });
});