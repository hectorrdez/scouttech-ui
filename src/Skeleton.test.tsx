import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Skeleton from "./Skeleton.js";

describe("Skeleton", () => {
  it("is hidden from assistive tech and has the default size", () => {
    render(<Skeleton />);
    const el = screen.getByTestId("skeleton");
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveClass("h-4", "w-full", "motion-safe:animate-pulse");
  });

  it("className replaces the default size", () => {
    render(<Skeleton className="h-10 w-10" />);
    const el = screen.getByTestId("skeleton");
    expect(el).toHaveClass("h-10", "w-10");
    expect(el).not.toHaveClass("h-4");
  });
});
