import { useId } from "react";
import { cx } from "./cx.js";

export const products = ["scouttech", "scoutgroup", "scoutlog", "scoutpulse", "scoutconnect"] as const;
export type Product = (typeof products)[number];

export const productNames: Record<Product, string> = {
  scouttech: "ScoutTech",
  scoutgroup: "ScoutGroup",
  scoutlog: "ScoutLog",
  scoutpulse: "ScoutPulse",
  scoutconnect: "ScoutConnect",
};

export type ProductMarkProps = {
  product: Product;
  /** Square size in px. Default 24. */
  size?: number;
  /** `brand` (default) paints `text-ui-brand-<product>`; `inherit` uses the parent's text colour. */
  tone?: "brand" | "inherit";
  /** Merged after the tone class (sizing, spacing). Use `tone="inherit"` to set your own colour. */
  className?: string;
  /** Accessible name. Without it the mark is decorative (aria-hidden). */
  title?: string;
};

// Colour classes are looked up, never built from a template string (see DESIGN.md).
const brandClassNames: Record<Product, string> = {
  scouttech: "text-ui-brand-scouttech",
  scoutgroup: "text-ui-brand-scoutgroup",
  scoutlog: "text-ui-brand-scoutlog",
  scoutpulse: "text-ui-brand-scoutpulse",
  scoutconnect: "text-ui-brand-scoutconnect",
};

/** Geometry copied from brand/<product>-mark.svg (viewBox 0 0 32 32, one ink = currentColor). */
function MarkGlyph({ product, maskId }: { product: Product; maskId: string }) {
  switch (product) {
    case "scouttech":
      return (
        <>
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 6 5 26h22L16 6Z" />
            <path d="M16 15v11" />
          </g>
          <circle cx="16" cy="6" r="3.5" />
          <circle cx="5" cy="26" r="3" />
          <circle cx="27" cy="26" r="3" />
        </>
      );
    case "scoutgroup":
      return (
        <>
          <path d="M16 2 22.5 11H9.5L16 2Z" />
          <path d="M16 8 24.5 19h-17L16 8Z" />
          <path d="M16 15 27 26H5l11-11Z" />
          <rect x="14" y="26" width="4" height="4" rx="1" />
        </>
      );
    case "scoutlog":
      return (
        <>
          <path
            fillRule="evenodd"
            d="M10 2h15a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3ZM17.5 5l-4 5.5h1.7L12 15h4.4v2.5h2.2V15H23l-3.2-4.5h1.7l-4-5.5ZM12 20v2h11v-2H12Zm0 4.5v2h7v-2h-7Z"
          />
          <rect x="4" y="7" width="5" height="2.5" rx="1.25" />
          <rect x="4" y="14.75" width="5" height="2.5" rx="1.25" />
          <rect x="4" y="22.5" width="5" height="2.5" rx="1.25" />
        </>
      );
    case "scoutpulse":
      // Mask luminance: white keeps the tile, black cuts the heartbeat line and the detached dot.
      return (
        <>
          <mask id={maskId}>
            <rect width="32" height="32" fill="white" />
            <path
              d="M5 17h4.5l2.5-6 4 11 3-7.5"
              fill="none"
              stroke="black"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="15" r="2.75" fill="black" />
          </mask>
          <rect width="32" height="32" rx="8" mask={`url(#${maskId})`} />
        </>
      );
    case "scoutconnect":
      return (
        <>
          <path
            d="M9 4h14a5 5 0 0 1 5 5v7a5 5 0 0 1-5 5h-8.5L9 27.5V21a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M16 8.5 10.5 17h11L16 8.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </>
      );
  }
}

/** Product logo mark (inline SVG). Colour comes from currentColor; default is the brand token colour. */
export function ProductMark({ product, size = 24, tone = "brand", className, title }: ProductMarkProps) {
  // useId yields ":r0:"-style ids; strip the colons so url(#…) resolves in every browser.
  const maskId = `scoutpulse-cut-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="currentColor"
      data-product={product}
      className={cx(tone === "brand" && brandClassNames[product], className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
    >
      {title && <title>{title}</title>}
      <MarkGlyph product={product} maskId={maskId} />
    </svg>
  );
}

export default ProductMark;
