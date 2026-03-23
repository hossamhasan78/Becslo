import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('signup page loads with correct elements', async ({ page }) => {
    await expect(page).toHaveTitle(/Sign In|Sign Up/);
    await expect(page.getByRole('heading', { name: /Sign In|Sign Up/ })).toBeVisible();
  });

  test('user can navigate to signup from login page', async ({ page }) => {
    await page.click('text=Don\'t have an account?');
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
  });

  test('user can navigate to login from signup page', async ({ page }) => {
    await page.goto('/signup');
    await page.click('text=Sign up');
    await page.click('text=Sign in');
    await expect(page).toHaveURL(/\/login/);
  });

  test('signup validates required fields', async ({ page }) => {
    await page.goto('/signup');
    
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/Please fill in all required fields/i)).toBeVisible();
  });

  test('signup validates password length', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('#email', 'test@example.com');
    await page.fill('#name', 'Test User');
    await page.fill('#password', 'short');
    
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/Password must be at least 6 characters/i)).toBeVisible();
  });

  test('signup shows success message and redirects to login', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('#email', `test-${Date.now()}@example.com`);
    await page.fill('#name', 'Test User');
    await page.fill('#password', 'password123');
    
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/Account created! Please log in/i)).toBeVisible();
    
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/login/);
  });

  test('login validates empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/Please fill in all required fields/i)).toBeVisible();
  });

  test('login validates email format', async ({ page }) => {
    await page.fill('#email', 'invalid-email');
    await page.fill('#password', 'password123');
    
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/Please enter a valid email address/i)).toBeVisible();
  });

  test('login shows error for invalid credentials', async ({ page }) => {
    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });

  test('successful login redirects to wizard', async ({ page }) => {
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/wizard/, { timeout: 5000 });
  });

  test('admin user is redirected to admin dashboard', async ({ page }) => {
    await page.route('**/auth/signInWithPassword*', async route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: {
              id: 'test-admin-id',
              email: 'admin@example.com',
              user_metadata: { role: 'admin' }
            },
            session: { access_token: 'mock-token' }
          }
        })
      });
    });
    
    await page.fill('#email', 'admin@example.com');
    await page.fill('#password', 'adminpassword');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/admin/, { timeout: 5000 });
  });

  test('login button shows loading state during submission', async ({ page }) => {
    await page.route('**/auth/signInWithPassword*', async route => {
      await page.waitForTimeout(1000);
      route.continue();
    });
    
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/Processing\.\.\./i)).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('signup button shows loading state during submission', async ({ page }) => {
    await page.goto('/signup');
    
    await page.route('**/auth/signUp*', async route => {
      await page.waitForTimeout(1000);
      route.continue();
    });
    
    await page.fill('#email', `test-${Date.now()}@example.com`);
    await page.fill('#name', 'Test User');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/Processing\.\.\./i)).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });
});