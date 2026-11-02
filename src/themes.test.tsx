import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Contrast contract for tokens.css + themes/*.css (feature 006). Values are read from the CSS files
// themselves, so the test fails if the approved hex values or the pairs drift.

// Vitest runs from the repo root (npm scripts), so cwd is the package root.
const repoRoot = process.cwd();
const read = (relative: string) => readFileSync(resolve(repoRoot, relative), "utf8");

const BRANDS = ["scoutgroup", "scoutlog", "scoutpulse", "scouttech"] as const;
const MODES = ["light", "dark"] as const;
type Mode = (typeof MODES)[number];
type Vars = Record<string, string>;

const ROOT_BLOCK = /:root\s*\{([^}]*)\}/;
const DARK_BLOCK = /html\[data-theme="dark"\]\s*\{([^}]*)\}/;
const DECL = /--ui-([a-z0-9-]+)\s*:\s*([^;]+);/g;

function parseVars(block: string): Vars {
  const vars: Vars = {};
  for (const match of block.matchAll(DECL)) vars[match[1]] = match[2].trim();
  return vars;
}

function parseModes(css: string): Record<Mode, Vars> {
  const light = ROOT_BLOCK.exec(css);
  const dark = DARK_BLOCK.exec(css);
  if (!light || !dark) throw new Error("expected :root and html[data-theme=\"dark\"] blocks");
  return { light: parseVars(light[1]), dark: parseVars(dark[1]) };
}

const tokensCss = read("tokens.css");
const themeBlockMatch = /@theme\s*\{([\s\S]*?)\n\}/.exec(tokensCss);
const base = parseModes(tokensCss.replace(/@theme\s*\{[\s\S]*?\n\}/, ""));
const brandVars: Record<string, Record<Mode, Vars>> = Object.fromEntries(
  BRANDS.map((brand) => [brand, parseModes(read(`themes/${brand}.css`))]),
);

function merged(brand: string | null, mode: Mode): Vars {
  return brand === null ? base[mode] : { ...base[mode], ...brandVars[brand][mode] };
}

function luminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`not a 6-digit hex colour: ${hex}`);
  const channels = [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const pairs: Array<{ fg: string; bg: string; min: number }> = [
  { fg: "on-primary", bg: "primary", min: 4.5 },
  { fg: "on-primary", bg: "primary-hover", min: 4.5 },
  { fg: "on-primary", bg: "primary-active", min: 4.5 },
  { fg: "primary-ink", bg: "surface", min: 4.5 },
  { fg: "primary-ink", bg: "surface-hover", min: 4.5 },
  { fg: "primary-ink", bg: "surface-tonal", min: 4.5 },
  { fg: "primary-ink", bg: "primary-soft", min: 4.5 },
  { fg: "on-surface", bg: "surface", min: 4.5 },
  { fg: "on-surface", bg: "surface-hover", min: 4.5 },
  { fg: "on-surface", bg: "surface-active", min: 4.5 },
  { fg: "on-surface", bg: "surface-tonal", min: 4.5 },
  { fg: "on-surface-muted", bg: "surface", min: 4.5 },
  { fg: "on-surface-muted", bg: "surface-hover", min: 4.5 },
  { fg: "on-surface-muted", bg: "surface-tonal", min: 4.5 },
  { fg: "on-danger", bg: "danger", min: 4.5 },
  { fg: "on-danger", bg: "danger-hover", min: 4.5 },
  { fg: "danger", bg: "danger-soft", min: 4.5 },
  { fg: "danger", bg: "surface", min: 4.5 },
  { fg: "warning", bg: "surface", min: 4.5 },
  { fg: "success", bg: "surface", min: 4.5 },
  { fg: "info", bg: "surface", min: 4.5 },
  { fg: "on-disabled", bg: "disabled", min: 4.5 },
  { fg: "focus", bg: "surface", min: 3 },
  { fg: "outline-strong", bg: "surface", min: 3 },
  // Product marks (base tokens, same in every theme): graphics need 3:1.
  { fg: "brand-scouttech", bg: "surface", min: 3 },
  { fg: "brand-scoutgroup", bg: "surface", min: 3 },
  { fg: "brand-scoutlog", bg: "surface", min: 3 },
  { fg: "brand-scoutpulse", bg: "surface", min: 3 },
  { fg: "brand-scoutconnect", bg: "surface", min: 3 },
];

const scenarios = [
  { brand: "neutral", theme: null as string | null },
  ...BRANDS.map((brand) => ({ brand, theme: brand })),
].flatMap(({ brand, theme }) => MODES.map((mode) => ({ brand, mode, theme })));

describe("theme files", () => {
  it.each(BRANDS.map((brand) => ({ brand })))("$brand exposes exactly the 6 brand vars in both modes", ({ brand }) => {
    const expected = ["primary", "on-primary", "primary-hover", "primary-active", "primary-ink", "primary-soft"].sort();
    for (const mode of MODES) {
      expect(Object.keys(brandVars[brand][mode]).sort(), `${brand} ${mode}`).toEqual(expected);
    }
  });

  it("tokens.css defines every --ui-* referenced by @theme in both modes", () => {
    expect(themeBlockMatch, "@theme block").not.toBeNull();
    const referenced = [...themeBlockMatch![1].matchAll(/var\(--ui-([a-z0-9-]+)\)/g)].map((m) => m[1]);
    expect(referenced.length).toBeGreaterThan(0);
    for (const mode of MODES) {
      const missing = referenced.filter((name) => !(name in base[mode]));
      expect(missing, `${mode} missing`).toEqual([]);
    }
  });

  it("@theme maps the 4 product brand tokens and base defines them in both modes", () => {
    const theme = themeBlockMatch![1];
    for (const product of BRANDS) {
      expect(theme, `--color-ui-brand-${product}`).toContain(`--color-ui-brand-${product}: var(--ui-brand-${product});`);
      for (const mode of MODES) {
        expect(base[mode], `${mode} brand-${product}`).toHaveProperty(`brand-${product}`);
      }
    }
  });

  it("the @theme animation for the chevrons is defined with its keyframes", () => {
    const theme = themeBlockMatch![1];
    expect(theme).toContain("--animate-ui-chevron: ui-chevron 1.4s ease-in-out infinite;");
    expect(theme).toMatch(/@keyframes ui-chevron\s*\{/);
  });

  it("brand themes never set the product brand tokens (they live in the base)", () => {
    for (const brand of BRANDS) {
      for (const mode of MODES) {
        const keys = Object.keys(brandVars[brand][mode]);
        expect(keys.filter((key) => key.startsWith("brand-")), `${brand} ${mode}`).toEqual([]);
      }
    }
  });

  it("the theme folder ships exactly the 4 brands", () => {
    const files = readdirSync(resolve(repoRoot, "themes")).filter((f) => f.endsWith(".css")).sort();
    expect(files).toEqual(BRANDS.map((b) => `${b}.css`).sort());
  });
});

describe.each(scenarios)("contrast: $brand $mode", ({ theme, mode }) => {
  it.each(pairs.map((p) => ({ ...p, theme, mode })))(
    "$fg on $bg >= $min",
    ({ fg, bg, min }) => {
      const vars = merged(theme, mode);
      const ratio = contrast(vars[fg], vars[bg]);
      expect(ratio, `${fg} ${vars[fg]} on ${bg} ${vars[bg]}`).toBeGreaterThanOrEqual(min);
    },
  );
});
