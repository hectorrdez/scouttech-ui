import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ColumnInverted from "./ColumnInverted.js";

describe("ColumnInverted", () => {
  it("renders children with the base classes and merges className", () => {
    render(
      <ColumnInverted className="gap-2" data-testid="x">
        <span>hijo</span>
      </ColumnInverted>,
    );
    const el = screen.getByTestId("x");
    expect(el).toHaveClass(...("flex flex-col-reverse gap-2".split(" ")));
    expect(screen.getByText("hijo")).toBeInTheDocument();
  });

  it("forwards div props", () => {
    render(
      <ColumnInverted id="a" aria-label="zona">
        x
      </ColumnInverted>,
    );
    expect(screen.getByLabelText("zona")).toHaveAttribute("id", "a");
  });
});
