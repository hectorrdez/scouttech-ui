import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NoLicensePage from "./NoLicensePage.js";

describe("NoLicensePage", () => {
  it("shows the no_license text by default with an external link", () => {
    render(<NoLicensePage product="scoutlog" ctaHref="https://scouttech.es/perfil" />);
    expect(screen.getByRole("heading", { level: 1, name: "No tienes licencia de ScoutLog" })).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: "Ir a mi perfil de ScoutTech" });
    expect(cta).toHaveAttribute("href", "https://scouttech.es/perfil");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("varies the text with reason not_granted", () => {
    render(<NoLicensePage product="scoutgroup" reason="not_granted" ctaHref="/p" />);
    expect(screen.getByRole("heading", { name: "No tienes acceso a ScoutGroup" })).toBeInTheDocument();
    expect(screen.getByText(/no te ha concedido acceso a ScoutGroup/)).toBeInTheDocument();
  });

  it("adds manageBy to the default message and can render a div root", () => {
    const { container } = render(<NoLicensePage product="scoutlog" as="div" manageBy="Ana" ctaHref="/p" />);
    expect(screen.getByText(/Contacta con Ana\./)).toBeInTheDocument();
    expect(container.querySelector("main")).toBeNull();
  });

  it("accepts title, message and ctaLabel overrides", () => {
    render(
      <NoLicensePage product="scoutpulse" title="Sin plan" message="Contacta con ventas" ctaHref="/p" ctaLabel="Ver planes" />,
    );
    expect(screen.getByRole("heading", { name: "Sin plan" })).toBeInTheDocument();
    expect(screen.getByText("Contacta con ventas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver planes" })).toBeInTheDocument();
  });
});
