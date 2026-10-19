import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import Card from "./Card.js";

describe("Card", () => {
  it("defaults to the elevated variant", () => {
    render(<Card>Contenido</Card>);
    const card = screen.getByText("Contenido");
    expect(card).toHaveAttribute("data-variant", "elevated");
    expect(card).toHaveClass("shadow-ui-card", "bg-ui-surface");
  });

  it("tonal variant uses the tonal surface", () => {
    render(<Card variant="tonal">Tonal</Card>);
    expect(screen.getByText("Tonal")).toHaveClass("bg-ui-surface-tonal");
  });

  it("outlined variant uses the outline border", () => {
    render(<Card variant="outlined">Borde</Card>);
    expect(screen.getByText("Borde")).toHaveClass("border-ui-outline");
  });

  it("interactive adds the hover shadow and pointer cursor", () => {
    render(<Card interactive>Clicable</Card>);
    const card = screen.getByText("Clicable");
    expect(card).toHaveClass("hover:shadow-ui-card-hover", "cursor-pointer");
  });

  it("merges className with the variant classes", () => {
    render(<Card className="mt-4">Merge</Card>);
    const card = screen.getByText("Merge");
    expect(card).toHaveClass("mt-4", "rounded-ui-card", "p-ui-card");
  });

  it("passes style, data-* and aria/role attributes through", () => {
    render(
      <Card data-foo="bar" role="region" aria-label="Resumen" style={{ opacity: 0.5 }}>
        Atributos
      </Card>,
    );
    const card = screen.getByRole("region", { name: "Resumen" });
    expect(card).toHaveAttribute("data-foo", "bar");
    expect(card).toHaveStyle({ opacity: "0.5" });
  });

  it("forwards the ref to the div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref}>Ref</Card>);
    expect(ref.current).toBe(screen.getByText("Ref"));
    expect(ref.current?.tagName).toBe("DIV");
  });
});
