import { expect, test } from "@playwright/test";
import { combos, open, type Helpers } from "./demo.js";

test("modal: Escape closes, Tab is trapped, focus returns to the trigger", async ({ page }) => {
  await open(page, "scouttech", "light");
  const trigger = page.getByRole("button", { name: "Abrir modal" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Modal de ejemplo" });
  await expect(dialog).toBeFocused();

  for (const key of ["Tab", "Shift+Tab"]) {
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press(key);
      expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
    }
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("modal: scrim click closes", async ({ page }) => {
  await open(page, "scouttech", "light");
  await page.getByRole("button", { name: "Abrir modal" }).click();
  await page.mouse.click(5, 5);
  await expect(page.getByRole("dialog")).toBeHidden();
});

test.describe("modal text contrast", () => {
  for (const { palette, theme } of combos) {
    test(`${palette} ${theme}: dialog text and controls >= 4.5:1`, async ({ page }) => {
      await open(page, palette, theme);
      await page.getByRole("button", { name: "Abrir modal" }).click();
      const result = await page.getByRole("dialog").evaluate((node) => {
        const h = (window as unknown as { __h: Helpers }).__h;
        const out: string[] = [];
        let checked = 0;
        for (const el of Array.from(node.querySelectorAll<HTMLElement>("h2, p, label, button, input"))) {
          if ((el as HTMLButtonElement).disabled) continue;
          // Icon-only close button has no text to measure.
          if (el.tagName !== "INPUT" && !(el.textContent ?? "").trim()) continue;
          checked++;
          const ratio = h.contrast(h.parseColor(getComputedStyle(el).color), h.effectiveBackground(el));
          if (ratio < 4.5) out.push(`${ratio.toFixed(2)} < 4.5 :: ${h.snippet(el)}`);
        }
        return { checked, out };
      });
      expect(result.checked).toBeGreaterThan(2);
      expect(result.out).toEqual([]);
    });
  }
});
