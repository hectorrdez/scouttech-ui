import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EmptyState from "./EmptyState.js";

describe("EmptyState", () => {
  it("renders title only", () => {
    render(<EmptyState title="Sin datos" />);
    expect(screen.getByRole("heading", { name: "Sin datos" })).toBeInTheDocument();
  });

  it("renders description, action and custom icon", () => {
    render(
      <EmptyState
        title="Sin eventos"
        description="Crea el primero"
        action={<button>Crear</button>}
        icon={<svg data-testid="mi-icono" />}
      />,
    );
    expect(screen.getByText("Crea el primero")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear" })).toBeInTheDocument();
    expect(screen.getByTestId("mi-icono")).toBeInTheDocument();
  });

  it("uses the default icon when none is given", () => {
    const { container } = render(<EmptyState title="x" />);
    expect(container.querySelector(".lucide-inbox")).not.toBeNull();
  });
});
