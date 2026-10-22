import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LegalLayout } from "./LegalLayout.js";
import { PublicFooter } from "./PublicFooter.js";
import { PublicHeader } from "./PublicHeader.js";
import { ThemeProvider } from "./theme.js";
import { SCOUTTECH_PATHS, scouttechUrl } from "./scouttechUrl.js";

const nav = [
  { label: "Productos", to: "/productos" },
  { label: "Precios", to: "/precios" },
  { label: "Sobre nosotros", to: "/nosotros", secondary: true },
  { label: "ScoutTech", to: "https://scouttech.example/", external: true },
];

function wrap(ui: React.ReactNode, route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>{ui}</ThemeProvider>
    </MemoryRouter>,
  );
}

describe("PublicHeader", () => {
  it("renders brand link, nav and actions", () => {
    wrap(<PublicHeader product="scoutpulse" nav={nav} actions={<a href="/entrar">Entrar</a>} />);
    expect(screen.getByRole("link", { name: "ScoutPulse, inicio" })).toHaveAttribute("href", "/");
    const main = screen.getByRole("navigation", { name: "Principal", hidden: true });
    expect(within(main).getAllByRole("link", { hidden: true })).toHaveLength(4);
    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
  });

  it("marks the current route", () => {
    wrap(<PublicHeader product="scoutgroup" nav={nav} />, "/precios");
    const links = screen.getAllByRole("link", { name: "Precios", hidden: true });
    expect(links[0]).toHaveAttribute("aria-current", "page");
  });

  it("external links open in a new tab with an sr-only hint and noopener", () => {
    wrap(<PublicHeader product="scoutgroup" nav={nav} />);
    const link = screen.getAllByRole("link", { name: /ScoutTech/, hidden: true }).find((l) => l.getAttribute("href")?.startsWith("https"))!;
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveTextContent("(se abre en otra pestaña)");
  });

  it("mobile menu toggles with aria-expanded and closes on navigate", async () => {
    const user = userEvent.setup();
    wrap(<PublicHeader product="scoutgroup" nav={nav} />);
    const button = screen.getByRole("button", { name: "Abrir menú" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    const toggle = screen.getByRole("button", { name: "Cerrar menú" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const mobile = screen.getByRole("navigation", { name: "Principal móvil" });
    expect(toggle).toHaveAttribute("aria-controls", mobile.id);
    await user.click(within(mobile).getByRole("link", { name: "Productos" }));
    expect(screen.queryByRole("navigation", { name: "Principal móvil" })).not.toBeInTheDocument();
  });

  it("themeToggle=false hides the theme switch", () => {
    wrap(<PublicHeader product="scoutgroup" nav={nav} themeToggle={false} />);
    expect(screen.queryByRole("radiogroup", { hidden: true })).not.toBeInTheDocument();
  });

  it("labels override the defaults", () => {
    wrap(<PublicHeader product="scoutgroup" nav={nav} labels={{ openMenu: "Open menu", brand: "Home" }} />);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });
});

describe("PublicFooter", () => {
  const columns = [
    { title: "Mapa web", links: [{ label: "Productos", to: "/productos" }] },
    { title: "Vacía", links: [] },
    { title: "Ecosistema", links: [{ label: "ScoutTech", to: "https://scouttech.example/", external: true }] },
  ];

  it("renders columns (skipping empty), legal nav and default copyright", () => {
    wrap(
      <PublicFooter
        product="scoutpulse"
        description="Resumen"
        columns={columns}
        legalLinks={[{ label: "Cookies", to: "/cookies" }]}
        year={2026}
      >
        <a href="mailto:a@b.c">a@b.c</a>
      </PublicFooter>,
    );
    expect(screen.getByRole("heading", { name: "Mapa web" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Vacía" })).not.toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "Legal" })).getByRole("link", { name: "Cookies" })).toHaveAttribute("href", "/cookies");
    expect(screen.getByText("© 2026 ScoutPulse. Todos los derechos reservados.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "a@b.c" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ScoutTech/ })).toHaveAttribute("target", "_blank");
  });

  it("custom copyright replaces the default and no legal nav without links", () => {
    wrap(<PublicFooter product="scoutlog" columns={[]} copyright="Mi texto" />);
    expect(screen.getByText("Mi texto")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});

describe("LegalLayout", () => {
  it("renders title, update date, body and sibling links with aria-current", () => {
    wrap(
      <LegalLayout
        title="Política de cookies"
        updated="Última actualización: 1 de octubre"
        links={[
          { label: "Cookies", to: "/cookies" },
          { label: "Términos", to: "/terminos" },
        ]}
      >
        <p>Cuerpo</p>
      </LegalLayout>,
      "/cookies",
    );
    expect(screen.getByRole("heading", { level: 1, name: "Política de cookies" })).toBeInTheDocument();
    expect(screen.getByText("Última actualización: 1 de octubre")).toBeInTheDocument();
    expect(screen.getByText("Cuerpo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cookies" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Términos" })).not.toHaveAttribute("aria-current");
  });

  it("omits the sibling nav when there are no links", () => {
    wrap(<LegalLayout title="T">x</LegalLayout>);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});

describe("scouttechUrl", () => {
  it("joins base + path and appends defined params", () => {
    expect(scouttechUrl("https://scouttech.example", SCOUTTECH_PATHS.register, { from: "scoutpulse", x: undefined })).toBe(
      "https://scouttech.example/crear-cuenta?from=scoutpulse",
    );
    expect(scouttechUrl("https://scouttech.example")).toBe("https://scouttech.example/");
    expect(scouttechUrl("https://scouttech.example", "legal")).toBe("https://scouttech.example/legal");
  });
});

describe("PublicHeader unified styling", () => {
  it("nav links rest muted, grow the underline on hover and mark the current route in primary ink", () => {
    wrap(<PublicHeader product="scoutgroup" nav={nav} />, "/precios");
    const current = screen.getAllByRole("link", { name: "Precios", hidden: true })[0];
    const other = screen.getAllByRole("link", { name: "Productos", hidden: true })[0];
    expect(current).toHaveClass("text-ui-primary-ink", "font-medium", "after:scale-x-100");
    expect(other).toHaveClass("text-ui-on-surface-muted", "hover:text-ui-on-surface", "hover:after:scale-x-100");
    expect(other).toHaveClass("after:scale-x-0", "after:origin-left", "motion-reduce:transition-none");
    expect(other).not.toHaveClass("text-ui-primary-ink");
  });

  it("sticky is on by default and can be turned off", () => {
    const { container, unmount } = wrap(<PublicHeader product="scoutgroup" nav={nav} />);
    expect(container.querySelector("header")).toHaveClass("sticky", "top-0", "z-40");
    unmount();
    const off = wrap(<PublicHeader product="scoutgroup" nav={nav} sticky={false} />);
    expect(off.container.querySelector("header")).not.toHaveClass("sticky");
  });

  it("renders the banner above the bar and a custom brand instead of the default logo", () => {
    wrap(
      <PublicHeader
        product="scoutlog"
        nav={nav}
        banner={<span>ScoutLog forma parte del ecosistema ScoutTech</span>}
        brand={<span>ScoutLog by ScoutTech</span>}
      />,
    );
    expect(screen.getByText("ScoutLog forma parte del ecosistema ScoutTech")).toBeInTheDocument();
    const brandLink = screen.getByRole("link", { name: "ScoutLog, inicio" });
    expect(within(brandLink).getByText("ScoutLog by ScoutTech")).toBeInTheDocument();
    expect(within(brandLink).queryByText("ScoutLog", { exact: true })).not.toBeInTheDocument();
  });

  it("omits the banner strip when no banner is given", () => {
    const { container } = wrap(<PublicHeader product="scoutgroup" nav={nav} />);
    expect(container.querySelector("header > div")).toHaveClass("h-16");
  });
});
