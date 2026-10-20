import { expect, test } from "@playwright/test";
import { combos, open, type Helpers } from "./demo.js";

test("dropdown: click opens menu in the viewport, Escape closes and returns focus", async ({ page }) => {
  await open(page, "scouttech", "light");
  const trigger = page.getByRole("button", { name: "Acciones" });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const menu = page.getByRole("menu", { name: "Acciones de ejemplo" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem")).toHaveCount(3);

  const box = await menu.boundingBox();
  const vp = page.viewportSize()!;
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height);

  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("dropdown: outside click closes", async ({ page }) => {
  await open(page, "scouttech", "light");
  const trigger = page.getByRole("button", { name: "Acciones" });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(page.getByRole("menu")).toBeHidden();
});

test.describe("dropdown text contrast", () => {
  for (const { palette, theme } of combos) {
    test(`${palette} ${theme}: enabled menu items >= 4.5:1`, async ({ page }) => {
      await open(page, palette, theme);
      const trigger = page.getByRole("button", { name: "Acciones" });
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      const result = await page.getByRole("menu").evaluate((node) => {
        const h = (window as unknown as { __h: Helpers }).__h;
        const out: string[] = [];
        let checked = 0;
        for (const el of Array.from(node.querySelectorAll<HTMLElement>("[role=menuitem] span"))) {
          if ((el as HTMLElement).closest("button")?.disabled) continue;
          if (el.children.length > 0 || !(el.textContent ?? "").trim()) continue;
          checked++;
          const ratio = h.contrast(h.parseColor(getComputedStyle(el).color), h.effectiveBackground(el));
          if (ratio < 4.5) out.push(`${ratio.toFixed(2)} < 4.5 :: ${h.snippet(el)}`);
        }
        return { checked, out };
      });
      expect(result.checked).toBeGreaterThan(1);
      expect(result.out).toEqual([]);
    });
  }
});
