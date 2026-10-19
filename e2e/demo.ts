import { expect, type Page } from "@playwright/test";

export type Palette = "scoutgroup" | "scoutlog" | "scouttech";
export type Theme = "light" | "dark";

export const THEME_KEY = "scouttech-ui-demo-theme";
export const PALETTE_KEY = "scouttech-ui-demo-palette";

export const combos: Array<{ palette: Palette; theme: Theme }> = [
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
export const helperSource = `
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

export async function open(page: Page, palette: Palette, theme: Theme) {
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


export type Helpers = {
  parseColor: (s: string) => number[];
  effectiveBackground: (el: Element) => number[];
  contrast: (fg: number[], bg: number[]) => number;
  snippet: (el: Element) => string;
};
