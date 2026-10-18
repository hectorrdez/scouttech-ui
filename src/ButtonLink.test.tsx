import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ButtonLink from "./ButtonLink.js";

describe("ButtonLink", () => {
  it("renders an <a> with the href inside a router", () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/alumnos">Alumnos</ButtonLink>
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: "Alumnos" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/alumnos");
    expect(link).not.toHaveAttribute("rel");
  });

  it("danger-soft link uses the soft danger surface", () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/borrar" variant="danger-soft">
          Borrar
        </ButtonLink>
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Borrar" })).toHaveClass("bg-ui-danger-soft");
  });

  it("external links render a plain anchor with noopener noreferrer", () => {
    render(
      <ButtonLink to="https://example.com" external target="_blank">
        Web
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "Web" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
