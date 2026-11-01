import { expect, test, type Page } from '@playwright/test';
import { loginAs, logout, USERS } from './helpers';

test.describe('Admin full end-to-end flow', () => {
  test('login as admin', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
  });

  test('dashboard loads KPIs without server errors', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    const errors: string[] = [];
    page.on('response', (res) => { if (res.status() >= 500) errors.push(`${res.status()} ${res.url()}`); });
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(errors).toEqual([]);
  });

  test('customers: view list', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/customers');
    await expect(page).toHaveURL(/\/admin\/customers(\/)?$/);
    await expect(page.locator('.adm-table-wrap')).toBeVisible();
  });

  test('customers: add new customer', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/customers/new');
    await expect(page).toHaveURL(/\/admin\/customers\/new/);
    await page.locator('input[placeholder="e.g. Rajesh Kumar"]').fill('E2E Test Customer');
    await page.locator('input[placeholder="10-digit mobile"]').fill('9999999999');
    await page.locator('input[type="email"]').fill('e2etest@example.com');
    await page.getByRole('button', { name: /save customer/i }).click();
  });

  test('customers: view customer detail', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/customers');
    const firstRow = page.locator('.adm-table-wrap tbody tr').first();
    if ((await firstRow.count()) > 0) {
      await firstRow.locator('td').first().click();
      await expect(page).toHaveURL(/\/admin\/customers\/\w/);
    }
  });

  test('eye tests: view list', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/eye-tests');
    await expect(page).toHaveURL(/\/admin\/eye-tests(\/)?$/);
  });

  test('products: view catalogue', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/products');
    await expect(page).toHaveURL(/\/admin\/products(\/)?$/);
  });

  test('POS: view point of sale', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/pos');
    await expect(page).toHaveURL(/\/admin\/pos(\/)?$/);
  });

  test('invoices: view invoice list', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/invoices');
    await expect(page).toHaveURL(/\/admin\/invoices(\/)?$/);
  });

  test('reports: view reports page', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/reports');
    await expect(page).toHaveURL(/\/admin\/reports(\/)?$/);
  });

  test('settings: view shop settings', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/settings');
    await expect(page).toHaveURL(/\/admin\/settings(\/)?$/);
  });

  test('staff: view staff management', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/staff');
    await expect(page).toHaveURL(/\/admin\/staff(\/)?$/);
  });

  test('bookings: view appointments and inquiries', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/bookings');
    await expect(page).toHaveURL(/\/admin\/bookings(\/)?$/);
  });

  test('payments: view payments', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/payments');
    await expect(page).toHaveURL(/\/admin\/payments(\/)?$/);
  });

  test('expenses: view expenses', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/expenses');
    await expect(page).toHaveURL(/\/admin\/expenses(\/)?$/);
  });

  test('purchases: view purchases', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/purchases');
    await expect(page).toHaveURL(/\/admin\/purchases(\/)?$/);
  });

  test('suppliers: view suppliers', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/suppliers');
    await expect(page).toHaveURL(/\/admin\/suppliers(\/)?$/);
  });

  test('audit log: view audit trail', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/audit');
    await expect(page).toHaveURL(/\/admin\/audit(\/)?$/);
  });

  test('orders: view orders', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/orders');
    await expect(page).toHaveURL(/\/admin\/orders(\/)?$/);
  });

  test('logout', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await logout(page);
  });
});