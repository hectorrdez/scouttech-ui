import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { matchMediaMock } from "./test/setup.js";
import ThemeToggle from "./ThemeToggle.js";
import { ThemeProvider } from "./theme.js";

function renderToggle(ui: ReactNode = <ThemeToggle />) {
  return render(<ThemeProvider storageKey="toggle-test">{ui}</ThemeProvider>);
}

describe("ThemeToggle", () => {
  it("renders a radiogroup with three radios", () => {
    matchMediaMock.setMatches(false);
    renderToggle();
    expect(screen.getByRole("radiogroup", { name: "Tema de la interfaz" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("aria-checked follows the mode and clicks change it", async () => {
    matchMediaMock.setMatches(false);
    renderToggle();
    const system = screen.getByRole("radio", { name: "Seguir al sistema" });
    const dark = screen.getByRole("radio", { name: "Tema oscuro" });
    expect(system).toHaveAttribute("aria-checked", "true");
    expect(dark).toHaveAttribute("aria-checked", "false");

    await userEvent.click(dark);
    expect(dark).toHaveAttribute("aria-checked", "true");
    expect(system).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("toggle-test")).toBe("dark");
  });

  it("uses custom labels", () => {
    matchMediaMock.setMatches(false);
    renderToggle(
      <ThemeToggle
        labels={{
          group: "Apariencia",
          light: "Claro",
          dark: "Oscuro",
          system: "Automático",
        }}
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "Apariencia" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Claro" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Oscuro" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Automático" })).toBeInTheDocument();
  });
});
