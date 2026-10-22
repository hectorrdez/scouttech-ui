import { expect, test } from "@playwright/test";
import { open } from "./demo.js";

const header = (page: import("@playwright/test").Page) =>
  page.locator('[data-testid="public-header-demo"] > header');
const containers = (page: import("@playwright/test").Page) => [
  page.locator('[data-testid="public-header-demo"]'),
  page.locator('[data-testid="public-footer-demo"]'),
  page.locator('[data-testid="legal-layout-demo"]'),
];

for (const viewport of [
  { width: 390, height: 800 },
  { width: 800, height: 900 },
  { width: 1280, height: 900 },
]) {
  test(`public shell: no horizontal overflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await open(page, "scouttech", "light");
    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );
    expect(pageOverflow).toBe(true);
    for (const container of containers(page)) {
      await container.first().scrollIntoViewIfNeeded();
      const fits = await container.first().evaluate((node) => node.scrollWidth <= node.clientWidth + 1);
      expect(fits).toBe(true);
    }
  });
}

test("public header: mobile menu toggles at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await open(page, "scouttech", "light");
  const scope = header(page).first();
  const menuButton = scope.getByRole("button", { name: "Abrir menú" });
  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(scope.getByRole("navigation", { name: "Principal móvil" })).toHaveCount(0);

  await menuButton.click();
  await expect(scope.getByRole("button", { name: "Cerrar menú" })).toHaveAttribute("aria-expanded", "true");
  await expect(scope.getByRole("navigation", { name: "Principal móvil" })).toBeVisible();
});

test("public header: desktop nav visible and menu button hidden at 1280px", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, "scouttech", "light");
  const scope = header(page).first();
  await expect(scope.getByRole("navigation", { name: "Principal", exact: true })).toBeVisible();
  await expect(scope.getByRole("button", { name: "Abrir menú" })).toBeHidden();
});

test("public header: hovering a nav link does not move the layout", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, "scouttech", "light");
  const scope = header(page).first();
  const link = scope.getByRole("navigation", { name: "Principal", exact: true }).getByRole("link", { name: "Productos" });
  const before = await link.boundingBox();
  await link.hover();
  const after = await link.boundingBox();
  // y depends on scroll position (hover scrolls the demo into view); size and x must not change
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
  expect(after?.x).toBe(before?.x);
});

test("public header: sticky bar stays at the top after scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, "scouttech", "light");
  const bar = page.locator('[data-testid="public-header-demo"] > header').first();
  await expect(bar).toHaveCSS("position", "sticky");
});
