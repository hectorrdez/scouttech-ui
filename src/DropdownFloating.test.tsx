import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DropdownFloating } from "./DropdownFloating.js";

const onEdit = vi.fn();

function Sample() {
  return (
    <DropdownFloating
      label="Acciones"
      items={[
        { label: "Editar", onClick: onEdit, description: "Cambiar datos" },
        { label: "Borrar", disabled: true },
        { label: "Activo", active: true, endIcon: <span>fin</span> },
      ]}
    >
      <button>Abrir</button>
    </DropdownFloating>
  );
}

describe("DropdownFloating", () => {
  it("is closed until the trigger is used", () => {
    render(<Sample />);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens into a portal with menuitems", async () => {
    const user = userEvent.setup();
    render(<Sample />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    const menu = screen.getByRole("menu", { name: "Acciones" });
    expect(menu.parentElement).toBe(document.body);
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
    expect(screen.getByText("Cambiar datos")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Borrar/ })).toBeDisabled();
    expect(screen.getByRole("menuitem", { name: /Activo/ })).toHaveAttribute("aria-current", "true");
  });

  it("click on an item runs it and closes", async () => {
    const user = userEvent.setup();
    render(<Sample />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    await user.click(screen.getByRole("menuitem", { name: /Editar/ }));
    expect(onEdit).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("ArrowDown opens; Escape and outside click close", async () => {
    const user = userEvent.setup();
    render(<Sample />);
    screen.getByRole("button", { name: "Abrir" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    await user.click(document.body);
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
