import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductMark, products, productNames } from "./ProductMark.js";

describe("ProductMark", () => {
  it.each(products.map((product) => ({ product })))("renders the $product mark", ({ product }) => {
    const { container } = render(<ProductMark product={product} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("data-product", product);
    expect(svg).toHaveAttribute("viewBox", "0 0 32 32");
    expect(svg).toHaveClass(`text-ui-brand-${product}`);
  });

  it("uses size 24 by default and honours size", () => {
    const { container, rerender } = render(<ProductMark product="scouttech" />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "24");
    rerender(<ProductMark product="scouttech" size={64} />);
    expect(container.querySelector("svg")).toHaveAttribute("height", "64");
  });

  it("is aria-hidden without a title", () => {
    const { container } = render(<ProductMark product="scoutlog" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
  });

  it("with a title is an img named by the title", () => {
    render(<ProductMark product="scoutgroup" title="ScoutGroup" />);
    const img = screen.getByRole("img", { name: "ScoutGroup" });
    expect(img).not.toHaveAttribute("aria-hidden");
    expect(img.tagName.toLowerCase()).toBe("svg");
  });

  it("keeps the brand colour when className only sizes the mark", () => {
    const { container } = render(<ProductMark product="scouttech" className="h-4 w-4" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-4", "w-4", "text-ui-brand-scouttech");
  });

  it("drops the brand colour with tone inherit", () => {
    const { container } = render(<ProductMark product="scouttech" tone="inherit" className="text-ui-primary" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-ui-primary");
    expect(svg).not.toHaveClass("text-ui-brand-scouttech");
  });

  it("exposes the display names", () => {
    expect(productNames).toEqual({
      scouttech: "ScoutTech",
      scoutgroup: "ScoutGroup",
      scoutlog: "ScoutLog",
      scoutpulse: "ScoutPulse",
    });
  });

  it("gives two scoutpulse instances different mask ids that the rect references", () => {
    const { container } = render(
      <>
        <ProductMark product="scoutpulse" />
        <ProductMark product="scoutpulse" />
      </>,
    );
    const masks = [...container.querySelectorAll("mask")];
    expect(masks).toHaveLength(2);
    const [first, second] = masks.map((mask) => mask.getAttribute("id"));
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(first).not.toBe(second);
    expect(first).toMatch(/^[a-zA-Z0-9_-]+$/);
    const rects = [...container.querySelectorAll("rect[mask]")];
    expect(rects.map((rect) => rect.getAttribute("mask"))).toEqual([`url(#${first})`, `url(#${second})`]);
  });
});
