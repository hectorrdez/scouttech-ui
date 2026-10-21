import { Menu, X } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ProductMark, productNames, type Product } from "./ProductMark.js";
import { ShellLink, type ShellLinkDef } from "./ShellLink.js";
import { ThemeToggle } from "./ThemeToggle.js";
import { cx } from "./cx.js";

export type PublicHeaderNavItem = ShellLinkDef & {
  /** Hidden from the desktop bar below `lg` (still in the mobile menu). */
  secondary?: boolean;
};

export type PublicHeaderLabels = {
  brand?: string;
  nav?: string;
  mobileNav?: string;
  openMenu?: string;
  closeMenu?: string;
};

export type PublicHeaderProps = {
  product: Product;
  /** Route of the brand link. Default "/". */
  brandHref?: string;
  nav: Array<PublicHeaderNavItem>;
  /** Right-hand slot (session link, call to action). Shown in the bar at every width. */
  actions?: ReactNode;
  /** Renders the ThemeToggle (bar on desktop, menu on mobile). Default true. */
  themeToggle?: boolean;
  labels?: PublicHeaderLabels;
  className?: string;
};

/** Public-site header: product brand, main nav, actions and a disclosure menu on mobile. */
export function PublicHeader({
  product,
  brandHref = "/",
  nav,
  actions,
  themeToggle = true,
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
    <header className={cx("w-full border-b border-ui-outline bg-ui-surface text-ui-on-surface", className)}>
      <div className="flex h-16 w-full items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-4 lg:gap-8">
          <Link
            to={brandHref}
            aria-label={text.brand}
            className="flex items-center gap-2 rounded-ui-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-focus"
          >
            <ProductMark product={product} size={28} />
            <span className="text-2xl font-semibold">{name}</span>
          </Link>
          <nav aria-label={text.nav} className="hidden md:block">
            <ul className="flex gap-4 lg:gap-6">
              {nav.map((item) => (
                <li key={item.to} className={item.secondary ? "max-lg:hidden" : undefined}>
                  <ShellLink link={item} active />
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-3 lg:gap-6">
          {themeToggle && <ThemeToggle className="max-md:hidden" />}
          {actions}
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
          <ul className="flex flex-col gap-3">
            {nav.map((item) => (
              <li key={item.to}>
                <ShellLink link={item} active onNavigate={() => setOpen(false)} />
              </li>
            ))}
          </ul>
          {themeToggle && <ThemeToggle className="mt-3" />}
        </nav>
      )}
    </header>
  );
}

export default PublicHeader;
