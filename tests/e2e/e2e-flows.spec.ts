import { test, expect } from '@playwright/test';
import { USERS, loginAs, logout, mainMenu } from './helpers';

test.describe('End-to-End User Journeys & Public Experience', () => {
  test('public homepage renders branding, navigation, and key sections', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Darshana Optical/i);
    await expect(page.locator('header, nav').first()).toBeVisible();
    await expect(page.locator('body')).toContainText(/Darshana Optical/i);
  });

  test('public navigation works across main pages', async ({ page }) => {
    await page.goto('/frames');
    await expect(page).toHaveURL(/\/frames/);
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/lenses');
    await expect(page).toHaveURL(/\/lenses/);
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/contact');
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/book-eye-test');
    await expect(page).toHaveURL(/\/book-eye-test/);
    await expect(page.locator('form')).toBeVisible();
  });

  test('role isolation: sequential sign-ins keep each account to its own menu', async ({ page }) => {
    await loginAs(page, USERS.staff.email, USERS.staff.password);
    await expect(mainMenu(page).getByRole('link', { name: 'Money' })).toHaveCount(0);
    await logout(page);

    await loginAs(page, USERS.manager.email, USERS.manager.password);
    await expect(mainMenu(page).getByRole('link', { name: 'Money' })).toBeVisible();
    await logout(page);

    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await expect(mainMenu(page).getByRole('link', { name: 'Money' })).toBeVisible();
    await logout(page);
  });
});
