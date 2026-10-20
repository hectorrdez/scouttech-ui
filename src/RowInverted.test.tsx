import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RowInverted from "./RowInverted.js";

describe("RowInverted", () => {
  it("renders children with the base classes and merges className", () => {
    render(
      <RowInverted className="gap-2" data-testid="x">
        <span>hijo</span>
      </RowInverted>,
    );
    const el = screen.getByTestId("x");
    expect(el).toHaveClass(...("flex flex-row-reverse gap-2".split(" ")));
    expect(screen.getByText("hijo")).toBeInTheDocument();
  });

  it("forwards div props", () => {
    render(
      <RowInverted id="a" aria-label="zona">
        x
      </RowInverted>,
    );
    expect(screen.getByLabelText("zona")).toHaveAttribute("id", "a");
  });
});
