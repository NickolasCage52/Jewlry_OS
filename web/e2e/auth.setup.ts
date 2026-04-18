import { test as setup } from "@playwright/test";
import path from "node:path";

const authFile = path.join(process.cwd(), "e2e", ".auth", "owner.json");

setup("authenticate as OWNER", async ({ page }) => {
  await page.goto("/login");
  await page.locator('select[name="role"]').selectOption("OWNER");
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL("**/app/dashboard**");
  await page.context().storageState({ path: authFile });
});
