import { Page, expect } from '@playwright/test';

export const USERS = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'admin@darshana.com',
    password: process.env.E2E_ADMIN_PASSWORD || 'admin@2026',
    role: 'admin',
    name: 'Darshana Raj',
  },
  manager: {
    email: process.env.E2E_MANAGER_EMAIL || 'manager@darshana.com',
    password: process.env.E2E_MANAGER_PASSWORD || 'manager@2026',
    role: 'manager',
    name: 'Arun Kumar',
  },
  staff: {
    email: process.env.E2E_STAFF_EMAIL || 'staff@darshana.com',
    password: process.env.E2E_STAFF_PASSWORD || 'staff@2026',
    role: 'staff',
    name: 'Kumar Muthu',
  },
} as const;

export type UserKey = keyof typeof USERS;

/** Signs in through the real sign-in page and waits for the admin menu. */
export async function loginAs(page: Page, email: string, pass: string) {
  expect(email, 'Email must not be empty').not.toBe('');
  expect(pass, 'Password must not be empty').not.toBe('');
  await page.context().clearCookies();
  await page.goto('/admin/login');
  // A fresh browser has nobody remembered, so the email box is shown straight away.
  await page.locator('#admin-email').waitFor({ state: 'visible', timeout: 15_000 });
  await page.locator('#admin-email').fill(email);
  await page.locator('#admin-password').fill(pass);
  await page.locator('#admin-login-submit').click();
  await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15_000 });
  await expect(page.getByRole('navigation', { name: 'Main' }).first()).toBeVisible({ timeout: 15_000 });
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Log out' }).first().click();
  await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10_000 });
}

/** The desktop left menu (the phone tab bar is also labelled "Main"). */
export const mainMenu = (page: Page) => page.getByRole('navigation', { name: 'Main' }).first();
