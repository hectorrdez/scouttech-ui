import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Row from "./Row.js";

describe("Row", () => {
  it("renders children with the base classes and merges className", () => {
    render(
      <Row className="gap-2" data-testid="x">
        <span>hijo</span>
      </Row>,
    );
    const el = screen.getByTestId("x");
    expect(el).toHaveClass(...("flex flex-row gap-2".split(" ")));
    expect(screen.getByText("hijo")).toBeInTheDocument();
  });

  it("forwards div props", () => {
    render(
      <Row id="a" aria-label="zona">
        x
      </Row>,
    );
    expect(screen.getByLabelText("zona")).toHaveAttribute("id", "a");
  });
});
