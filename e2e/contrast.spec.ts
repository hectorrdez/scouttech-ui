import { expect, test } from "@playwright/test";
import { combos, open, type Helpers } from "./demo.js";

test.describe("text contrast on the demo", () => {
  for (const { palette, theme } of combos) {
    test(`${palette} ${theme}: text >= 4.5:1`, async ({ page }) => {
      await open(page, palette, theme);

      const result = await page.evaluate(() => {
        const h = (window as unknown as { __h: {
          parseColor: (s: string) => number[];
          effectiveBackground: (el: Element) => number[];
          contrast: (fg: number[], bg: number[]) => number;
          snippet: (el: Element) => string;
          isVisible: (el: Element) => boolean;
          isEnabled: (el: Element) => boolean;
        } }).__h;
        const selector = "button, a[href], input, select, label, [role=alert], p[id$='-hint']";
        const out: string[] = [];
        let checked = 0;
        // Text-bearing elements inside [data-e2e-text] sections (cards, stat cards, cookie consent).
        const textNodes = Array.from(
          document.querySelectorAll<HTMLElement>("main [data-e2e-text] :is(h3, p, span, div)"),
        ).filter((el) => Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? "").trim()));
        const candidates = [
          ...Array.from(document.querySelectorAll<HTMLElement>(`main ${selector}`)),
          ...textNodes,
        ];
        for (const el of candidates) {
          if (!h.isVisible(el) || !h.isEnabled(el)) continue;
          const isField = el.tagName === "INPUT" || el.tagName === "SELECT";
          if (!isField && !(el.textContent ?? "").trim()) continue;
          checked++;
          const ratio = h.contrast(
            h.parseColor(getComputedStyle(el).color),
            h.effectiveBackground(el),
          );
          if (ratio < 4.5) out.push(`text ${ratio.toFixed(2)} < 4.5 :: ${h.snippet(el)}`);
        }
        return { checked, out };
      });

      expect(result.checked, "controls checked").toBeGreaterThan(10);
      expect(result.out).toEqual([]);
    });
  }
});

test.describe("focus outline contrast on the demo", () => {
  for (const { palette, theme } of combos) {
    test(`${palette} ${theme}: focus outline >= 3:1, >= 2px, reachable by Tab`, async ({ page }) => {
      await open(page, palette, theme);

      const total = await page.evaluate(() => {
        const sel =
          "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [role=switch], [role=radio]";
        let i = 0;
        for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
          if (el.getAttribute("aria-disabled") === "true") continue;
          el.dataset.e2eFocus = String(i++);
        }
        return i;
      });
      expect(total).toBeGreaterThan(0);

      const failures: string[] = [];
      const reached = new Set<string>();

      for (let press = 0; press < total + 10 && reached.size < total; press++) {
        await page.keyboard.press("Tab");
        const info = await page.evaluate(async () => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el.dataset.e2eFocus === undefined) return null;
          // transition-colors also animates outline-color: wait for the focus ring to settle.
          await Promise.all(el.getAnimations().map((a) => a.finished.catch(() => undefined)));
          const h = (window as unknown as { __h: {
            parseColor: (s: string) => number[];
            effectiveBackground: (el: Element) => number[];
            snippet: (el: Element) => string;
          } }).__h;
          const style = getComputedStyle(el);
          return {
            id: el.dataset.e2eFocus,
            focusVisible: el.matches(":focus-visible"),
            outlineStyle: style.outlineStyle,
            outlineWidth: parseFloat(style.outlineWidth),
            outlineColorText: style.outlineColor,
            outlineColor: h.parseColor(style.outlineColor),
            parentBg: h.effectiveBackground(el.parentElement ?? el),
            snippet: h.snippet(el),
          };
        });
        if (!info || reached.has(info.id)) continue;
        reached.add(info.id);

        if (!info.focusVisible) failures.push(`not :focus-visible :: ${info.snippet}`);
        if (info.outlineStyle === "none") failures.push(`outline-style none :: ${info.snippet}`);
        if (!(info.outlineWidth >= 2)) {
          failures.push(`outline-width ${info.outlineWidth}px < 2px :: ${info.snippet}`);
        }
        const ratio = await page.evaluate(
          ({ color, bg }) =>
            (window as unknown as { __h: { contrast: (a: number[], b: number[]) => number } }).__h.contrast(color, bg),
          { color: info.outlineColor, bg: info.parentBg },
        );
        if (ratio < 3) {
          failures.push(`outline ${info.outlineColorText} ratio ${ratio.toFixed(2)} < 3 :: ${info.snippet}`);
        }
      }

      expect(reached.size, "every enabled focusable control must be reachable with Tab").toBe(total);
      expect(failures).toEqual([]);
    });
  }
});


test.describe("danger-soft hover contrast on the demo", () => {
  for (const { palette, theme } of combos) {
    test(`${palette} ${theme}: danger-soft text >= 4.5:1 at rest and on hover`, async ({ page }) => {
      await open(page, palette, theme);

      const buttons = page.locator('main :is(button,a)[class*="bg-ui-danger-soft"]:not([disabled])');
      const count = await buttons.count();
      expect(count, "danger-soft controls checked").toBeGreaterThan(0);

      const measure = (el: Element) => {
        const h = (window as unknown as { __h: Helpers }).__h;
        const ratio = h.contrast(
          h.parseColor(getComputedStyle(el).color),
          h.effectiveBackground(el),
        );
        return { ratio, snippet: h.snippet(el) };
      };

      const failures: string[] = [];
      for (let i = 0; i < count; i++) {
        const el = buttons.nth(i);

        const rest = await el.evaluate(measure);
        if (rest.ratio < 4.5) failures.push(`rest ${rest.ratio.toFixed(2)} < 4.5 :: ${rest.snippet}`);

        await el.hover();
        // transition-colors animates the background and text colour: wait for it to settle.
        await el.evaluate(async (node) => {
          await Promise.all(node.getAnimations().map((a) => a.finished.catch(() => undefined)));
        });
        const hover = await el.evaluate(measure);
        if (hover.ratio < 4.5) failures.push(`hover ${hover.ratio.toFixed(2)} < 4.5 :: ${hover.snippet}`);

        await page.mouse.move(0, 0);
      }

      expect(failures).toEqual([]);
    });
  }
});

test.describe("mandatory bar contrast on the demo", () => {
  for (const { palette, theme } of combos) {
    test(`${palette} ${theme}: mandatory bar >= 3px and >= 3:1 against its surface`, async ({ page }) => {
      await open(page, palette, theme);

      const bars = page.locator('main [class*="border-l-ui-warning"]');
      const count = await bars.count();
      expect(count, "mandatory controls checked").toBeGreaterThan(0);

      const failures: string[] = [];
      for (let i = 0; i < count; i++) {
        const result = await bars.nth(i).evaluate((node) => {
          const h = (window as unknown as { __h: Helpers }).__h;
          const style = getComputedStyle(node);
          const color = h.parseColor(style.borderLeftColor);
          const bg = h.effectiveBackground(node.parentElement ?? node);
          return {
            width: parseFloat(style.borderLeftWidth),
            ratio: h.contrast(color, bg),
            snippet: h.snippet(node),
          };
        });
        if (!(result.width >= 3)) {
          failures.push(`bar width ${result.width}px < 3px :: ${result.snippet}`);
        }
        if (result.ratio < 3) {
          failures.push(`bar ratio ${result.ratio.toFixed(2)} < 3 :: ${result.snippet}`);
        }
      }

      expect(failures).toEqual([]);
    });
  }
});
