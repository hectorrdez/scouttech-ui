import { expect, test, type Locator, type Page } from "@playwright/test";
import { combos, open, type Helpers } from "./demo.js";

async function openConsent(page: Page): Promise<Locator> {
  await page.getByRole("button", { name: "Configurar cookies" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe("cookie consent dialog on narrow screens", () => {
  for (const width of [320, 375, 414]) {
    test(`${width}px: dialog is focused, fits the viewport and does not scroll sideways`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      await open(page, "scoutgroup", "light");
      const dialog = await openConsent(page);
      await expect(dialog).toBeFocused();

      const overflow = await page.evaluate(() => ({
        page: document.documentElement.scrollWidth - window.innerWidth,
      }));
      expect(overflow.page, "page horizontal overflow").toBeLessThanOrEqual(0);

      const dialogOverflow = await dialog.evaluate((node) => node.scrollWidth - node.clientWidth);
      expect(dialogOverflow, "dialog horizontal overflow").toBeLessThanOrEqual(0);

      const box = await dialog.boundingBox();
      expect(box, "dialog box").not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    });
  }
});

test.describe("cookie consent text contrast", () => {
  for (const { palette, theme } of combos) {
    test(`${palette} ${theme}: dialog text and controls >= 4.5:1`, async ({ page }) => {
      await open(page, palette, theme);
      await openConsent(page);

      const result = await page.getByRole("dialog").evaluate((node) => {
        const h = (window as unknown as { __h: Helpers }).__h;
        const textSelector = "h2, h3, p, span";
        const controlSelector = "button, a[href]";
        const out: string[] = [];
        let checked = 0;
        const candidates = [
          ...Array.from(node.querySelectorAll<HTMLElement>(textSelector)).filter((el) =>
            Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? "").trim()),
          ),
          ...Array.from(node.querySelectorAll<HTMLElement>(controlSelector)).filter((el) =>
            (el.textContent ?? "").trim(),
          ),
        ];
        for (const el of candidates) {
          checked++;
          const ratio = h.contrast(h.parseColor(getComputedStyle(el).color), h.effectiveBackground(el));
          if (ratio < 4.5) out.push(`text ${ratio.toFixed(2)} < 4.5 :: ${h.snippet(el)}`);
        }
        return { checked, out };
      });

      expect(result.checked, "dialog text checked").toBeGreaterThan(5);
      expect(result.out).toEqual([]);
    });
  }
});

test("Aceptar todas closes the dialog and stores every section as on", async ({ page }) => {
  await open(page, "scoutgroup", "light");
  const dialog = await openConsent(page);

  await dialog.getByRole("button", { name: "Aceptar todas" }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByTestId("cookie-result")).toContainText('"marketing":true');
});
