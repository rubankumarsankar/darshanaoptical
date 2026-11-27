import { test, expect } from '@playwright/test';
import { USERS, loginAs } from './helpers';

const SCREENS: [string, RegExp][] = [
  ['/admin', /good (morning|afternoon|evening)/i],
  ['/admin/sale', /new sale/i],
  ['/admin/bills', /^bills$/i],
  ['/admin/bookings', /bookings/i],
  ['/admin/customers', /customers/i],
  ['/admin/orders', /orders/i],
  ['/admin/products', /products/i],
  ['/admin/stock', /stock/i],
  ['/admin/money', /money/i],
  ['/admin/report', /monthly report/i],
  ['/admin/settings', /settings/i],
  ['/admin/eye-test', /eye test/i],
  ['/admin/take-payment', /take payment/i],
  ['/admin/new-stock', /new stock arrived/i],
];

test.describe('Admin screens', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
  });

  test('every screen opens without a server error', async ({ page }) => {
    const failures: string[] = [];
    page.on('response', (r) => {
      if (r.status() >= 500) failures.push(`${r.status()} ${r.url()}`);
    });
    for (const [path, heading] of SCREENS) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1, name: heading }).first()).toBeVisible({ timeout: 15_000 });
    }
    expect(failures).toEqual([]);
  });

  const OLD: [string, RegExp][] = [
    ['/admin/dashboard', /\/admin\/?$/],
    ['/admin/pos', /\/admin\/sale/],
    ['/admin/invoices', /\/admin\/bills/],
    ['/admin/inventory', /\/admin\/stock/],
    ['/admin/expenses', /\/admin\/money/],
    ['/admin/reports', /\/admin\/report/],
    ['/admin/staff', /\/admin\/settings\?tab=staff/],
    ['/admin/audit', /\/admin\/settings\?tab=activity/],
  ];
  for (const [from, to] of OLD) {
    test(`old address ${from} still works`, async ({ page }) => {
      await page.goto(from);
      await expect(page).toHaveURL(to);
    });
  }

  for (const width of [390, 1440]) {
    test(`home has no sideways scrolling at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/admin');
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
