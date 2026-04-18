import { test, expect } from "@playwright/test";

test.describe("Wave 1 — baseline screenshots (desktop 1440×900)", () => {
  test("dashboard", async ({ page }) => {
    await page.goto("/app/dashboard");
    await expect(page.locator("main.app-main")).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("wave1-dashboard.png", {
      fullPage: true,
    });
  });

  test("sales list", async ({ page }) => {
    await page.goto("/app/sales");
    await expect(page.locator("main.app-main")).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("wave1-sales-list.png", {
      fullPage: true,
    });
  });

  test("sales detail (mock id=1)", async ({ page }) => {
    await page.goto("/app/sales/1");
    await expect(page.locator("main.app-main")).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("wave1-sales-detail.png", {
      fullPage: true,
    });
  });

  test("content center", async ({ page }) => {
    await page.goto("/app/content");
    await expect(page.locator("main.app-main")).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("wave1-content.png", {
      fullPage: true,
    });
  });

  test("catalog", async ({ page }) => {
    await page.goto("/app/catalog");
    await expect(page.locator("main.app-main")).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("wave1-catalog.png", {
      fullPage: true,
    });
  });
});
