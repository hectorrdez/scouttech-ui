import type { ReactNode } from "react";
import { ButtonLink } from "./ButtonLink.js";
import { cx } from "./cx.js";
import { ProductMark, productNames, type Product } from "./ProductMark.js";

export type NoLicenseReason = "no_license" | "not_granted";

export type NoLicensePageProps = {
  product: Product;
  /** `no_license`: the account has no licence for the product. `not_granted`: licence exists but access was not granted. */
  reason?: NoLicenseReason;
  /** Replaces the default title. */
  title?: ReactNode;
  /** Replaces the default message. */
  message?: ReactNode;
  /** Where the button goes (e.g. the ScoutTech profile; see `scouttechUrl`). */
  ctaHref: string;
  ctaLabel?: ReactNode;
  /** Plain `<a>` (default, cross-domain). `false` uses the router Link. */
  external?: boolean;
  /** Name of who grants access (e.g. the org owner). Adds "Contacta con {manageBy}." to the default message. */
  manageBy?: string | null;
  /** Root element. `main` (default) for a real page; `div` when something else already provides the main landmark. */
  as?: "main" | "div";
  className?: string;
};

const defaultCtaLabel = "Ir a mi perfil de ScoutTech";

/** Screen for a valid login without licence/access to the app. No network, no redirects: the gate is the app's. */
export function NoLicensePage({
  product,
  reason = "no_license",
  title,
  message,
  ctaHref,
  ctaLabel = defaultCtaLabel,
  external = true,
  manageBy,
  as: Root = "main",
  className,
}: NoLicensePageProps) {
  const name = productNames[product];
  const defaultTitle =
    reason === "not_granted" ? `No tienes acceso a ${name}` : `No tienes licencia de ${name}`;
  const baseMessage =
    reason === "not_granted"
      ? `Tu licencia no te ha concedido acceso a ${name}. Pídelo al administrador o revisa tu perfil de ScoutTech.`
      : `Tu cuenta no tiene una licencia activa para ${name}. Gestiona tus aplicaciones desde tu perfil de ScoutTech.`;
  const defaultMessage = manageBy ? `${baseMessage} Contacta con ${manageBy}.` : baseMessage;

  return (
    <Root
      className={cx(
        "flex min-h-screen flex-col items-center justify-center gap-4 bg-ui-surface px-4 py-12 text-center text-ui-on-surface",
        className,
      )}
    >
      <ProductMark product={product} size={48} />
      <h1 className="text-2xl font-semibold">{title ?? defaultTitle}</h1>
      <p className="max-w-md text-base text-ui-on-surface-muted">{message ?? defaultMessage}</p>
      <ButtonLink to={ctaHref} external={external}>
        {ctaLabel}
      </ButtonLink>
    </Root>
  );
}

export default NoLicensePage;
