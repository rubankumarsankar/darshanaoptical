import { test, expect } from '@playwright/test';
import { loginAs, USERS } from './helpers';

test.describe('Customer validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
  });

  test('the add-customer form explains a bad phone number in plain words', async ({ page }) => {
    await page.goto('/admin/customers');
    await page.getByRole('button', { name: '+ Add customer' }).click();
    await page.getByLabel('Name').fill('Ravi Kumar');
    await page.getByLabel('Mobile number').fill('12345');
    await page.getByRole('button', { name: 'Save customer' }).click();
    await expect(page.getByRole('alert').filter({ hasText: /10-digit mobile number/ })).toBeVisible();
  });

  test('server rejects invalid names, phones, and customer path IDs', async ({ page }) => {
    const numericName = await page.request.post('/api/admin/customers', { data: { name: '123', phone: '9876543210' } });
    expect(numericName.status()).toBe(400);

    const invalidPhone = await page.request.post('/api/admin/customers', { data: { name: 'Ravi Kumar', phone: '123' } });
    expect(invalidPhone.status()).toBe(400);

    for (const id of ['1', 'Ravi', encodeURIComponent('https://example.com')]) {
      const response = await page.request.get(`/api/admin/customers/${id}`);
      expect(response.status()).toBe(400);
    }
  });

  test('old customer profile addresses open the customer search', async ({ page }) => {
    await page.goto('/admin/customers/do-2026-001');
    await expect(page).toHaveURL(/\/admin\/customers\?q=do-2026-001/);
  });
});
