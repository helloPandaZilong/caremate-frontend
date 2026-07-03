import { expect } from "@playwright/test";

const DASHBOARD_PATH = {
  customer: "/customer/dashboard",
  shop: "/shop/dashboard",
  admin: "/admin/dashboard",
};

export async function login(page, role, account) {
  await page.goto("/auth");
  await page.locator('input[type="email"]').fill(account.email);
  await page.locator('input[type="password"]').fill(account.password);
  await page.getByRole("button", { name: "로그인", exact: true }).last().click();
  await expect(page).toHaveURL(new RegExp(DASHBOARD_PATH[role]), { timeout: 10000 });
}
