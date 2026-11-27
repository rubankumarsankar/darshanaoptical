import { test, expect } from '@playwright/test';
import { USERS, loginAs, mainMenu } from './helpers';

test.describe('What each role can see and do', () => {
  test('front desk: no Money in the menu and no shop totals on Home', async ({ page }) => {
    await loginAs(page, USERS.staff.email, USERS.staff.password);
    const menu = mainMenu(page);
    await expect(menu.getByRole('link', { name: 'New sale' })).toBeVisible();
    await expect(menu.getByRole('link', { name: 'Money' })).toHaveCount(0);
    await expect(page.getByText('Sold today')).toHaveCount(0);
  });

  test('front desk: typing the Money address goes back to Home', async ({ page }) => {
    await loginAs(page, USERS.staff.email, USERS.staff.password);
    await page.goto('/admin/money');
    await expect(page).toHaveURL(/\/admin\/?$/);
  });

  test('front desk: the server refuses money, staff and settings changes', async ({ page }) => {
    await loginAs(page, USERS.staff.email, USERS.staff.password);
    expect((await page.request.get('/api/admin/simple/money')).status()).toBe(403);
    expect((await page.request.get('/api/admin/simple/report')).status()).toBe(403);
    expect((await page.request.get('/api/admin/staff')).status()).toBe(403);
    expect((await page.request.put('/api/admin/settings', { data: { max_discount_staff: 100 } })).status()).toBe(403);
    const home = await (await page.request.get('/api/admin/simple/home')).json();
    expect(home.today).toBeUndefined();
  });

  test('manager: sees Money, but only Bills & tax and Activity in Settings', async ({ page }) => {
    await loginAs(page, USERS.manager.email, USERS.manager.password);
    await expect(mainMenu(page).getByRole('link', { name: 'Money' })).toBeVisible();
    await expect(page.getByText('Sold today')).toBeVisible();
    await page.goto('/admin/settings');
    await expect(page.getByRole('tab', { name: 'Bills & tax' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Activity' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Staff' })).toHaveCount(0);
    await expect(page.getByRole('tab', { name: 'Shop details' })).toHaveCount(0);
  });

  test('owner: every Settings tab', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password);
    await page.goto('/admin/settings');
    for (const tab of ['Shop details', 'Staff', 'Bills & tax', 'Email alerts', 'Activity']) {
      await expect(page.getByRole('tab', { name: tab })).toBeVisible();
    }
  });
});
