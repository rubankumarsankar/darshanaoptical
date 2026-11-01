import { test, expect } from '@playwright/test';
import { loginAs, USERS } from './helpers';

test.describe('Customer validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
  });

  test('rejects numeric and URL customer names without submitting', async ({ page }) => {
    await page.goto('/admin/customers/new');

    const name = page.getByPlaceholder('e.g. Rajesh Kumar');
    const phone = page.getByPlaceholder('10-digit mobile');
    const save = page.getByRole('button', { name: /save customer/i });

    await name.fill('1,2,3');
    await phone.fill('9876543210');
    await save.click();
    await expect(page.getByText('Use at least 2 letters; numbers and URLs are not allowed')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/customers\/new/);

    await name.fill('https://example.com');
    await save.click();
    await expect(page.getByText('Use at least 2 letters; numbers and URLs are not allowed')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/customers\/new/);
  });

  test('server rejects invalid names, phones, and customer path IDs', async ({ page }) => {
    const numericName = await page.request.post('/api/admin/customers', {
      data: { name: '123', phone: '9876543210' },
    });
    expect(numericName.status()).toBe(400);

    const invalidPhone = await page.request.post('/api/admin/customers', {
      data: { name: 'Ravi Kumar', phone: '123' },
    });
    expect(invalidPhone.status()).toBe(400);

    for (const id of ['1', 'Ravi', encodeURIComponent('https://example.com')]) {
      const response = await page.request.get(`/api/admin/customers/${id}`);
      expect(response.status()).toBe(400);
    }
  });

  test('customer list uses the canonical API URL without an empty query string', async ({ page }) => {
    const requestPromise = page.waitForRequest((request) =>
      request.url().includes('/api/admin/customers') && request.method() === 'GET'
    );
    await page.goto('/admin/customers');
    const request = await requestPromise;
    expect(new URL(request.url()).search).toBe('');
    await expect(page.getByText('Rubankumar Sankar')).toBeVisible();
  });

  test('customer detail has no development CSP eval error', async ({ page }) => {
    const consoleErrors: string[] = [];
    let customerRequests = 0;
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('request', (request) => {
      if (request.url().endsWith('/api/admin/customers/do-2026-001')) customerRequests += 1;
    });

    await page.goto('/admin/customers/do-2026-001');
    await expect(page.getByText('Rubankumar Sankar').first()).toBeVisible();
    expect(consoleErrors.filter((message) => message.includes('eval() is not supported'))).toEqual([]);
    expect(customerRequests).toBe(1);
  });

  test('old UUID profile URL redirects to the readable customer number', async ({ page }) => {
    await page.goto('/admin/customers/b510155d-0910-4dac-b627-72df5db8e66c');
    await expect(page).toHaveURL(/\/admin\/customers\/do-2026-001$/);
    await expect(page.getByText('Rubankumar Sankar').first()).toBeVisible();
  });
});
