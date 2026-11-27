import { test, expect } from '@playwright/test';
import { USERS, loginAs, logout } from './helpers';

test.describe('Sign in and access control', () => {
  test('sign-in page shows the email form on a fresh device', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.locator('#admin-email')).toBeVisible();
    await expect(page.locator('#admin-password')).toBeVisible();
    await expect(page.locator('#admin-login-submit')).toBeVisible();
  });

  for (const path of ['/admin', '/admin/settings', '/admin/money', '/admin/sale']) {
    test(`signed-out visit to ${path} goes to sign-in`, async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login/);
    });
  }

  test('wrong password is refused in plain words', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('#admin-email').fill(USERS.admin.email);
    await page.locator('#admin-password').fill('definitely-wrong-password');
    await page.locator('#admin-login-submit').click();
    await expect(page.getByRole('alert').filter({ hasText: /don.t match|paused/i })).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('Show / Hide switches the password field', async ({ page }) => {
    await page.goto('/admin/login');
    const pw = page.locator('#admin-password');
    await expect(pw).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(pw).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Hide password' }).click();
    await expect(pw).toHaveAttribute('type', 'password');
  });

  test('sign-in returns to a protected deep link', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/admin/bills');
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fbills/);
    await page.locator('#admin-email').fill(USERS.admin.email);
    await page.locator('#admin-password').fill(USERS.admin.password);
    await page.locator('#admin-login-submit').click();
    await expect(page).toHaveURL(/\/admin\/bills/);
  });

  test('the next sign-in on this device offers a name tile', async ({ page }) => {
    await loginAs(page, USERS.staff.email, USERS.staff.password);
    await logout(page);
    await expect(page.getByRole('radio', { name: new RegExp(USERS.staff.name.split(' ')[0]) })).toBeVisible();
  });

  test('log out ends the session', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await logout(page);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
