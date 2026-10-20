import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { ProductMark, productNames, type Product } from "./ProductMark.js";
import { cx } from "./cx.js";

export type AuthBrandHeaderProps = {
  product: Product;
  /** Overrides the default heading. */
  title?: ReactNode;
  /** Overrides the default subtitle. */
  subtitle?: ReactNode;
  /** Renders a link under the header (e.g. "¿Qué es una cuenta ScoutTech?"). */
  accountInfoHref?: string;
  accountInfoLabel?: string;
  className?: string;
};

// Static lookup: stagger delays are whole class names so Tailwind can generate them.
const chevronClassNames = [
  "motion-safe:animate-ui-chevron",
  "motion-safe:animate-ui-chevron motion-safe:[animation-delay:200ms]",
  "motion-safe:animate-ui-chevron motion-safe:[animation-delay:400ms]",
];

/** Login heading with the product mark. ScoutTech alone, or ScoutTech › › › product for the ecosystem apps. */
export function AuthBrandHeader({
  product,
  title,
  subtitle,
  accountInfoHref,
  accountInfoLabel = "¿Qué es una cuenta ScoutTech?",
  className,
}: AuthBrandHeaderProps) {
  const isScoutTech = product === "scouttech";
  const name = productNames[product];
  const heading = title ?? (isScoutTech ? "ScoutTech" : `Inicia sesión en ${name}`);
  const sub = subtitle ?? (isScoutTech ? "Inicia sesión" : "con tu cuenta de ScoutTech");
  const marksLabel = isScoutTech ? "ScoutTech" : `Acceso a ${name} con tu cuenta de ScoutTech`;

  return (
    <header className={cx("flex flex-col items-center gap-3 text-center", className)}>
      <div role="img" aria-label={marksLabel} className="flex items-center gap-3">
        <ProductMark product="scouttech" size={isScoutTech ? 40 : 32} />
        {!isScoutTech && (
          <>
            {chevronClassNames.map((classes, index) => (
              <ChevronRight
                key={index}
                size={16}
                aria-hidden="true"
                className={cx("text-ui-on-surface-muted", classes)}
              />
            ))}
            <ProductMark product={product} size={32} />
          </>
        )}
      </div>
      <h1 className="text-xl font-semibold text-ui-on-surface">{heading}</h1>
      <p className="text-sm text-ui-on-surface-muted">{sub}</p>
      {accountInfoHref && (
        <a
          href={accountInfoHref}
          className="rounded-ui-control text-sm font-medium text-ui-primary-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus"
        >
          {accountInfoLabel}
        </a>
      )}
    </header>
  );
}

export default AuthBrandHeader;
