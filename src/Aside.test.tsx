import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ReactElement } from "react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LayoutDashboard, Users } from "lucide-react";
import Aside, { type AsideItem } from "./Aside.js";

const items: AsideItem[] = [
  { label: "Inicio", to: "/", end: true, icon: <LayoutDashboard /> },
  { label: "Socios", to: "/socios", icon: <Users />, badge: <span>12</span> },
  { label: "Eventos", to: "/eventos", disabled: true, disabledReason: "Próximamente" },
];

function renderAside(ui: ReactElement, path = "/") {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
}

describe("Aside", () => {
  it("renders a labelled navigation with items and sections", () => {
    renderAside(
      <Aside
        aria-label="Principal"
        items={[{ label: "Inicio", to: "/" }]}
        sections={[{ title: "Gestión", items: [{ label: "Socios", to: "/socios" }] }]}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Principal" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("group", { name: "Gestión" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Socios" })).toHaveAttribute("href", "/socios");
  });

  it("marks the active route with aria-current and the active classes", () => {
    renderAside(<Aside items={items} />, "/socios");
    const active = screen.getByRole("link", { name: /Socios/ });
    expect(active).toHaveAttribute("aria-current", "page");
    expect(active).toHaveClass("bg-ui-primary-soft", "text-ui-primary-ink");
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveAttribute("aria-current");
  });

  it("renders the badge and the footer slot when expanded", () => {
    renderAside(<Aside items={items} footer={<p>Plan Pro</p>} />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Plan Pro")).toBeInTheDocument();
  });

  it("collapsed rail hides labels, badge and footer but keeps aria-label and title", () => {
    renderAside(<Aside items={items} footer={<p>Plan Pro</p>} defaultCollapsed />);
    expect(screen.queryByText("Socios")).not.toBeInTheDocument();
    expect(screen.queryByText("12")).not.toBeInTheDocument();
    expect(screen.queryByText("Plan Pro")).not.toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Socios" });
    expect(link).toHaveAttribute("title", "Socios");
    expect(link).toHaveAttribute("aria-label", "Socios");
  });

  it("toggles uncontrolled by default and reports aria-expanded with overridable labels", async () => {
    const user = userEvent.setup();
    renderAside(<Aside items={items} collapseLabel="Cerrar barra" expandLabel="Abrir barra" />);
    const toggle = screen.getByRole("button", { name: "Cerrar barra" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.click(toggle);
    const expand = screen.getByRole("button", { name: "Abrir barra" });
    expect(expand).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Socios")).not.toBeInTheDocument();
    await user.click(expand);
    expect(screen.getByText("Socios")).toBeInTheDocument();
  });

  it("uses the default Contraer/Expandir labels", () => {
    renderAside(<Aside items={items} />);
    expect(screen.getByRole("button", { name: "Contraer" })).toHaveAttribute("aria-expanded", "true");
  });

  it("controlled collapsed calls onToggle with the next value and does not change on its own", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderAside(<Aside items={items} collapsed={false} onToggle={onToggle} />);
    await user.click(screen.getByRole("button", { name: "Contraer" }));
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(screen.getByText("Socios")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Contraer" })).toHaveAttribute("aria-expanded", "true");
  });

  it("controlled collapsed state is rendered as the rail", () => {
    renderAside(<Aside items={items} collapsed onToggle={() => {}} />);
    expect(screen.queryByText("Socios")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expandir" })).toHaveAttribute("aria-expanded", "false");
  });

  it("renders a disabled item as a non-link span with aria-disabled and its reason", () => {
    renderAside(<Aside items={items} />);
    expect(screen.queryByRole("link", { name: "Eventos" })).not.toBeInTheDocument();
    const disabled = screen.getByText("Eventos").closest("[aria-disabled]");
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    expect(disabled).toHaveAttribute("title", "Próximamente");
    expect(disabled?.tagName).toBe("SPAN");
  });

  it("applies topOffset as the sticky top and height", () => {
    const { container } = renderAside(<Aside items={items} topOffset="64px" />);
    expect(container.querySelector("aside")).toHaveStyle({ top: "64px" });
  });

  it("accepts className overrides", () => {
    const { container } = renderAside(<Aside items={items} className="!static h-full" />);
    expect(container.querySelector("aside")).toHaveClass("!static", "h-full");
  });

  describe("mobile drawer", () => {
    it("closes on Escape", async () => {
      const user = userEvent.setup();
      const onCloseMobile = vi.fn();
      renderAside(<Aside items={items} mobileOpen onCloseMobile={onCloseMobile} />);
      await user.keyboard("{Escape}");
      expect(onCloseMobile).toHaveBeenCalledTimes(1);
    });

    it("closes on backdrop click", async () => {
      const user = userEvent.setup();
      const onCloseMobile = vi.fn();
      renderAside(<Aside items={items} mobileOpen onCloseMobile={onCloseMobile} />);
      await user.click(screen.getByRole("button", { name: "Cerrar menú" }));
      expect(onCloseMobile).toHaveBeenCalledTimes(1);
    });

    it("has no backdrop when closed and does not close on Escape", async () => {
      const user = userEvent.setup();
      const onCloseMobile = vi.fn();
      renderAside(<Aside items={items} mobileOpen={false} onCloseMobile={onCloseMobile} />);
      expect(screen.queryByRole("button", { name: "Cerrar menú" })).not.toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(onCloseMobile).not.toHaveBeenCalled();
    });

    it("closes when the location changes, not on mount", async () => {
      const user = userEvent.setup();
      const onCloseMobile = vi.fn();
      function Harness() {
        const [open, setOpen] = useState(true);
        return (
          <>
            <Aside
              items={items}
              mobileOpen={open}
              onCloseMobile={() => {
                onCloseMobile();
                setOpen(false);
              }}
            />
            <Routes>
              <Route path="*" element={<Nav />} />
            </Routes>
          </>
        );
      }
      function Nav() {
        const navigate = useNavigate();
        return <button onClick={() => navigate("/otra")}>ir</button>;
      }
      renderAside(<Harness />);
      expect(onCloseMobile).not.toHaveBeenCalled();
      await user.click(screen.getByRole("button", { name: "ir" }));
      expect(onCloseMobile).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("button", { name: "Cerrar menú" })).not.toBeInTheDocument();
    });
  });
});
