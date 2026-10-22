import { Menu, X } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ButtonLink } from "./ButtonLink.js";
import { ProductMark, productNames, type Product } from "./ProductMark.js";
import { ShellLink, type ShellLinkDef } from "./ShellLink.js";
import { ThemeToggle } from "./ThemeToggle.js";
import { cx } from "./cx.js";

export type PublicHeaderNavItem = ShellLinkDef & {
  /** Hidden from the desktop bar below `xl` (still in the mobile menu). */
  secondary?: boolean;
};

export type PublicHeaderLabels = {
  brand?: string;
  nav?: string;
  mobileNav?: string;
  openMenu?: string;
  closeMenu?: string;
};

export type PublicHeaderSession = {
  /** Ghost link, e.g. "Entrar". */
  login?: ShellLinkDef;
  /** Primary call to action, e.g. "Probar gratis". */
  cta?: ShellLinkDef;
};

export type PublicHeaderProps = {
  product: Product;
  /** Route of the brand link. Default "/". */
  brandHref?: string;
  /** Replaces the default logo block (chip + product name), e.g. a "by ScoutTech" lockup. */
  brand?: ReactNode;
  nav: Array<PublicHeaderNavItem>;
  /** Right-hand slot (session link, call to action). Shown in the bar at every width. */
  actions?: ReactNode;
  /** Standard session links: ghost login + primary CTA. In the bar from `sm` up, in the mobile menu below. Rendered after `actions`. */
  session?: PublicHeaderSession;
  /** Optional strip above the bar, e.g. "ScoutLog forma parte del ecosistema ScoutTech". */
  banner?: ReactNode;
  /** Renders the ThemeToggle (bar on desktop, menu on mobile). Default true. */
  themeToggle?: boolean;
  /** Keeps the bar at the top of the viewport while scrolling. Default true. */
  sticky?: boolean;
  labels?: PublicHeaderLabels;
  className?: string;
};

/** Public-site header: product brand, main nav, actions and a disclosure menu on mobile. */
export function PublicHeader({
  product,
  brandHref = "/",
  brand,
  nav,
  actions,
  session,
  banner,
  themeToggle = true,
  sticky = true,
  labels,
  className,
}: PublicHeaderProps) {
  const name = productNames[product];
  const text = {
    brand: `${name}, inicio`,
    nav: "Principal",
    mobileNav: "Principal móvil",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    ...labels,
  };
  const [open, setOpen] = useState(false);
  const menuId = useId();

  return (
    <header
      className={cx(
        "w-full border-b border-ui-outline bg-ui-surface text-ui-on-surface",
        sticky && "sticky top-0 z-40",
        className,
      )}
    >
      {banner && (
        <div className="border-b border-ui-outline bg-ui-surface-tonal px-4 py-2 text-center text-sm text-ui-on-surface-muted md:px-8">
          {banner}
        </div>
      )}
      <div className="flex h-16 w-full items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-4 xl:gap-8">
          <Link
            to={brandHref}
            aria-label={text.brand}
            className="flex items-center gap-3 rounded-ui-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus"
          >
            {brand ?? (
              <>
                <span className="flex h-8 w-8 items-center justify-center rounded-ui-control bg-ui-primary text-ui-on-primary">
                  <ProductMark product={product} size={20} tone="inherit" />
                </span>
                <span className="text-xl font-semibold">{name}</span>
              </>
            )}
          </Link>
          <nav aria-label={text.nav} className="hidden md:block">
            <ul className="flex gap-4 xl:gap-6">
              {nav.map((item) => (
                <li key={item.to} className={item.secondary ? "max-xl:hidden" : undefined}>
                  <ShellLink link={item} active />
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-3 xl:gap-4">
          {themeToggle && <ThemeToggle className="max-md:hidden" />}
          {actions}
          {session && (
            <div className="flex items-center gap-2 max-sm:hidden">
              {session.login && <SessionLink link={session.login} variant="ghost" />}
              {session.cta && <SessionLink link={session.cta} variant="primary" />}
            </div>
          )}
          <button
            type="button"
            className="rounded-ui-control p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus md:hidden"
            aria-label={open ? text.closeMenu : text.openMenu}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>
      {open && (
        <nav id={menuId} aria-label={text.mobileNav} className="border-t border-ui-outline px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {nav.map((item) => (
              <li key={item.to}>
                <ShellLink
                  link={item}
                  active
                  onNavigate={() => setOpen(false)}
                  className="block rounded-ui-control px-2 py-2 hover:bg-ui-surface-hover"
                />
              </li>
            ))}
          </ul>
          {session && (
            <div className="mt-3 flex flex-col gap-2 sm:hidden">
              {session.login && <SessionLink link={session.login} variant="ghost" full onNavigate={() => setOpen(false)} />}
              {session.cta && <SessionLink link={session.cta} variant="primary" full onNavigate={() => setOpen(false)} />}
            </div>
          )}
          {themeToggle && <ThemeToggle className="mt-3" />}
        </nav>
      )}
    </header>
  );
}

function SessionLink({
  link,
  variant,
  full,
  onNavigate,
}: {
  link: ShellLinkDef;
  variant: "ghost" | "primary";
  full?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <ButtonLink to={link.to} external={link.external} variant={variant} size="sm" className={full ? "w-full" : undefined} onClick={onNavigate}>
      {link.label}
    </ButtonLink>
  );
}

export default PublicHeader;
