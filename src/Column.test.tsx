import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Column from "./Column.js";

describe("Column", () => {
  it("renders children with the base classes and merges className", () => {
    render(
      <Column className="gap-2" data-testid="x">
        <span>hijo</span>
      </Column>,
    );
    const el = screen.getByTestId("x");
    expect(el).toHaveClass(...("flex flex-col gap-2".split(" ")));
    expect(screen.getByText("hijo")).toBeInTheDocument();
  });

  it("forwards div props", () => {
    render(
      <Column id="a" aria-label="zona">
        x
      </Column>,
    );
    expect(screen.getByLabelText("zona")).toHaveAttribute("id", "a");
  });
});
