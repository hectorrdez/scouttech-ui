import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Badge, { badgeClassName } from "./Badge.js";

describe("Badge", () => {
  it("defaults to the neutral tone and merges className", () => {
    render(<Badge className="ml-2">Activo</Badge>);
    const el = screen.getByText("Activo");
    expect(el).toHaveAttribute("data-tone", "neutral");
    expect(el).toHaveClass("bg-ui-surface-tonal", "ml-2");
  });

  it.each([
    ["primary", "bg-ui-primary-soft"],
    ["success", "text-ui-success"],
    ["warning", "text-ui-warning"],
    ["danger", "bg-ui-danger-soft"],
    ["info", "text-ui-info"],
  ] as const)("tone %s uses its tokens", (tone, cls) => {
    render(<Badge tone={tone}>x</Badge>);
    expect(screen.getByText("x")).toHaveClass(cls);
  });

  it("custom adds no colour classes so the app can pass its own", () => {
    render(
      <Badge tone="custom" className="bg-castores-bg text-castores-fg">
        Castores
      </Badge>,
    );
    const el = screen.getByText("Castores");
    expect(el).toHaveClass("bg-castores-bg", "text-castores-fg");
    expect(el.className).not.toContain("bg-ui-");
  });

  it("badgeClassName returns the base classes", () => {
    expect(badgeClassName("danger")).toContain("inline-flex");
  });
});
