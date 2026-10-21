import type { ReactNode } from "react";
import { ShellLink, type ShellLinkDef } from "./ShellLink.js";
import { cx } from "./cx.js";

export type LegalLayoutProps = {
  title: string;
  /** Last-update text, e.g. "Última actualización: 1 de octubre de 2026". */
  updated?: ReactNode;
  /** Sibling legal documents. The current route is marked with aria-current. */
  links?: Array<ShellLinkDef>;
  linksLabel?: string;
  /** The document body. Plain headings/paragraphs/lists get readable defaults. */
  children: ReactNode;
  className?: string;
};

/** Page shell for legal documents: title, update date, optional sibling nav and a readable prose column. */
export function LegalLayout({
  title,
  updated,
  links = [],
  linksLabel = "Documentos legales",
  children,
  className,
}: LegalLayoutProps) {
  return (
    <div className={cx("mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:flex-row md:px-8 md:py-12", className)}>
      {links.length > 0 && (
        <nav aria-label={linksLabel} className="md:w-56 md:shrink-0">
          <ul className="flex flex-col gap-2 text-sm">
            {links.map((link) => (
              <li key={link.to}>
                <ShellLink link={link} active />
              </li>
            ))}
          </ul>
        </nav>
      )}
      <article className="min-w-0 flex-1 text-ui-on-surface">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {updated && <p className="mt-2 text-sm text-ui-on-surface-muted">{updated}</p>}
        <div className="mt-6 flex max-w-prose flex-col gap-4 text-base leading-relaxed [&_a]:text-ui-primary-ink [&_a]:underline [&_a]:rounded-ui-control [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-ui-focus [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6">
          {children}
        </div>
      </article>
    </div>
  );
}

export default LegalLayout;
