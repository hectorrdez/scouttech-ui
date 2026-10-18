import { expect, test, type Page } from "@playwright/test";

type Palette = "scoutgroup" | "scoutlog" | "scouttech";
type Theme = "light" | "dark";

const THEME_KEY = "scouttech-ui-demo-theme";
const PALETTE_KEY = "scouttech-ui-demo-palette";

const combos: Array<{ palette: Palette; theme: Theme }> = [
  { palette: "scoutgroup", theme: "light" },
  { palette: "scoutgroup", theme: "dark" },
  { palette: "scoutlog", theme: "light" },
  { palette: "scoutlog", theme: "dark" },
  { palette: "scouttech", theme: "light" },
  { palette: "scouttech", theme: "dark" },
];

/**
 * Colour helpers, installed on window.__h. Colours are parsed by painting them on a
 * 1x1 canvas, so oklch / color-mix / rgb() all work.
 */
const helperSource = `
window.__h = (() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  function parseColor(input) {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000000";
    ctx.fillStyle = input;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  }

  // Source-over compositing of a translucent layer onto an opaque base.
  function over(top, base) {
    const a = top[3];
    return [top[0] * a + base[0] * (1 - a), top[1] * a + base[1] * (1 - a), top[2] * a + base[2] * (1 - a), 1];
  }

  function effectiveBackground(el) {
    const layers = [];
    let node = el;
    while (node) {
      const c = parseColor(getComputedStyle(node).backgroundColor);
      if (c[3] > 0) {
        layers.push(c);
        if (c[3] >= 1) break;
      }
      node = node.parentElement;
    }
    let base = [255, 255, 255, 1];
    if (layers.length && layers[layers.length - 1][3] >= 1) {
      base = layers.pop();
    } else {
      const root = parseColor(getComputedStyle(document.documentElement).backgroundColor);
      if (root[3] >= 1) base = root;
    }
    for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return base;
  }

  function luminance(c) {
    const lin = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  }

  function contrast(fg, bg) {
    const text = fg[3] >= 1 ? fg : over(fg, bg);
    const a = luminance(text);
    const b = luminance(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  function snippet(el) {
    const html = el.outerHTML;
    return html.length > 180 ? html.slice(0, 180) + "..." : html;
  }

  function isVisible(el) {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
  }

  function isEnabled(el) {
    return !el.disabled && el.getAttribute("aria-disabled") !== "true";
  }

  return { parseColor, effectiveBackground, contrast, snippet, isVisible, isEnabled };
})();
`;

async function open(page: Page, palette: Palette, theme: Theme) {
  await page.addInitScript(
    ([themeKey, paletteKey, t, p]) => {
      localStorage.setItem(themeKey, t);
      localStorage.setItem(paletteKey, p);
    },
    [THEME_KEY, PALETTE_KEY, theme, palette] as const,
  );
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  await expect(page.locator("html")).toHaveAttribute("data-demo", palette);
  // The Vite dev server occasionally drops a module request on the first load of a
  // fresh browser context (ECONNREFUSED / preamble not detected). A reload recovers it.
  for (let attempt = 1; ; attempt++) {
    const mounted = await page
      .locator("main")
      .waitFor({ state: "visible", timeout: 10_000 })
      .then(() => true, () => false);
    if (mounted) break;
    if (attempt >= 3) throw new Error("demo did not mount after 3 loads");
    await page.reload();
  }
  await page.addScriptTag({ content: helperSource });
}

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
        for (const el of Array.from(document.querySelectorAll<HTMLElement>(`main ${selector}`))) {
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

type Helpers = {
  parseColor: (s: string) => number[];
  effectiveBackground: (el: Element) => number[];
  contrast: (fg: number[], bg: number[]) => number;
  snippet: (el: Element) => string;
};

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
