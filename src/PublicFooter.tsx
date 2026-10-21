import type { ReactNode } from "react";
import { productNames, type Product } from "./ProductMark.js";
import { ShellLink, type ShellLinkDef } from "./ShellLink.js";
import { cx } from "./cx.js";

export type PublicFooterColumn = {
  title: string;
  links: Array<ShellLinkDef>;
};

export type PublicFooterProps = {
  product: Product;
  /** Short product blurb under the name. */
  description?: ReactNode;
  /** Link columns (site map, ecosystem, help, social...). Empty ones are skipped. */
  columns: Array<PublicFooterColumn>;
  /** Legal links shown in the bottom row. */
  legalLinks?: Array<ShellLinkDef>;
  /** Extra content under the description (e.g. sign-up link, contact email). */
  children?: ReactNode;
  /** Replaces "© {year} {name}. Todos los derechos reservados.". */
  copyright?: ReactNode;
  /** Year in the default copyright. Default: current year. */
  year?: number;
  legalLabel?: string;
  className?: string;
};

const linkClassName = "w-fit text-xs hover:underline";

/** Public-site footer: brand blurb, link columns and a bottom row with copyright and legal links. */
export function PublicFooter({
  product,
  description,
  columns,
  legalLinks = [],
  children,
  copyright,
  year = new Date().getFullYear(),
  legalLabel = "Legal",
  className,
}: PublicFooterProps) {
  const name = productNames[product];
  return (
    <footer className={cx("flex justify-center bg-ui-surface-tonal text-ui-on-surface", className)}>
      <div className="flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="flex max-w-xs flex-col gap-2">
            <p className="text-base font-semibold">{name}</p>
            {description && <p className="text-xs text-ui-on-surface-muted">{description}</p>}
            {children}
          </div>
          {columns
            .filter((column) => column.links.length > 0)
            .map((column) => (
              <div key={column.title} className="flex flex-col gap-2">
                <h2 className="text-base font-semibold">{column.title}</h2>
                <ul className="flex flex-col gap-1">
                  {column.links.map((link) => (
                    <li key={link.to}>
                      <ShellLink link={link} className={linkClassName} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
        <div className="flex flex-col gap-2 border-t border-ui-outline pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ui-on-surface-muted">
            {copyright ?? `© ${year} ${name}. Todos los derechos reservados.`}
          </p>
          {legalLinks.length > 0 && (
            <nav aria-label={legalLabel}>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {legalLinks.map((link) => (
                  <li key={link.to}>
                    <ShellLink link={link} className={linkClassName} />
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
