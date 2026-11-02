import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthBrandHeader } from "./AuthBrandHeader.js";

describe("AuthBrandHeader", () => {
  it("scouttech shows the ScoutTech heading and sign-in subtitle", () => {
    render(<AuthBrandHeader product="scouttech" />);
    expect(screen.getByRole("heading", { level: 1, name: "ScoutTech" })).toBeInTheDocument();
    expect(screen.getByText("Inicia sesión")).toBeInTheDocument();
  });

  it("app variant shows the product heading and ecosystem subtitle", () => {
    render(<AuthBrandHeader product="scoutlog" />);
    expect(screen.getByRole("heading", { level: 1, name: "Inicia sesión en ScoutLog" })).toBeInTheDocument();
    expect(screen.getByText("con tu cuenta de ScoutTech")).toBeInTheDocument();
  });

  it("scoutconnect shows the ScoutConnect heading, ecosystem subtitle and the ScoutConnect mark", () => {
    const { container } = render(<AuthBrandHeader product="scoutconnect" />);
    expect(screen.getByRole("heading", { level: 1, name: "Inicia sesión en ScoutConnect" })).toBeInTheDocument();
    expect(screen.getByText("con tu cuenta de ScoutTech")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Acceso a ScoutConnect con tu cuenta de ScoutTech" })).toBeInTheDocument();
    const marks = [...container.querySelectorAll("[data-product]")].map((m) => m.getAttribute("data-product"));
    expect(marks).toEqual(["scouttech", "scoutconnect"]);
  });

  it("title and subtitle override the defaults", () => {
    render(<AuthBrandHeader product="scoutpulse" title="Entra" subtitle="Hola" />);
    expect(screen.getByRole("heading", { level: 1, name: "Entra" })).toBeInTheDocument();
    expect(screen.getByText("Hola")).toBeInTheDocument();
  });

  it("has a single aria-label on the marks row (app variant)", () => {
    render(<AuthBrandHeader product="scoutgroup" />);
    const row = screen.getByRole("img", { name: "Acceso a ScoutGroup con tu cuenta de ScoutTech" });
    expect(row).toHaveAttribute("aria-label", "Acceso a ScoutGroup con tu cuenta de ScoutTech");
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("marks row label for scouttech is the product name", () => {
    render(<AuthBrandHeader product="scouttech" />);
    expect(screen.getByRole("img", { name: "ScoutTech" })).toBeInTheDocument();
  });

  it("renders the two marks and three chevrons for app variants, all aria-hidden", () => {
    const { container } = render(<AuthBrandHeader product="scoutlog" />);
    const marks = container.querySelectorAll("[data-product]");
    expect([...marks].map((m) => m.getAttribute("data-product"))).toEqual(["scouttech", "scoutlog"]);
    const chevrons = container.querySelectorAll(".lucide-chevron-right");
    expect(chevrons).toHaveLength(3);
    for (const el of [...marks, ...chevrons]) expect(el).toHaveAttribute("aria-hidden", "true");
  });

  it("links to the account info only when href is given", () => {
    const { rerender } = render(<AuthBrandHeader product="scoutlog" />);
    expect(screen.queryByRole("link")).toBeNull();
    rerender(<AuthBrandHeader product="scoutlog" accountInfoHref="/cuenta" />);
    expect(screen.getByRole("link", { name: "¿Qué es una cuenta ScoutTech?" })).toHaveAttribute("href", "/cuenta");
  });

  it("animates chevrons only under motion-safe, never unconditionally", () => {
    const { container } = render(<AuthBrandHeader product="scoutlog" />);
    const chevrons = [...container.querySelectorAll(".lucide-chevron-right")];
    for (const chevron of chevrons) {
      const tokens = (chevron.getAttribute("class") ?? "").split(/\s+/);
      expect(tokens).toContain("motion-safe:animate-ui-chevron");
      for (const token of tokens) {
        if (token.includes("animate-")) expect(token.startsWith("motion-safe:")).toBe(true);
      }
    }
  });
});
