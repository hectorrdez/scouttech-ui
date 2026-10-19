import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CookieConsent, { type CookieConsentSection } from "./CookieConsent.js";

const sections: CookieConsentSection[] = [
  { key: "marketing", title: "Marketing", description: "Anuncios personalizados" },
  { key: "analysis", title: "Análisis", description: "Medición de uso" },
  { key: "technical", title: "Técnicas", description: "Necesarias", required: true },
];

function renderConsent(props: Partial<Parameters<typeof CookieConsent>[0]> = {}) {
  const onSubmit = vi.fn();
  render(
    <CookieConsent
      title="Selecciona cómo tratamos tu información"
      sections={sections}
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return { onSubmit };
}

describe("CookieConsent", () => {
  it("is a dialog named by its title", () => {
    renderConsent();
    expect(
      screen.getByRole("dialog", { name: "Selecciona cómo tratamos tu información" }),
    ).toBeInTheDocument();
  });

  it("moves focus to the dialog on render", () => {
    renderConsent();
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("locks required switches on and ignores clicks", async () => {
    renderConsent();
    const technical = screen.getByRole("switch", { name: /Técnicas/ });
    expect(technical).toHaveAttribute("aria-checked", "true");
    expect(technical).toHaveAttribute("aria-disabled", "true");

    await userEvent.click(technical);
    expect(technical).toHaveAttribute("aria-checked", "true");
  });

  it("submits the toggled values with 'Aceptar selección'", async () => {
    const { onSubmit } = renderConsent();
    await userEvent.click(screen.getByRole("switch", { name: /Marketing/ }));
    await userEvent.click(screen.getByRole("button", { name: "Aceptar selección" }));
    expect(onSubmit).toHaveBeenCalledWith({ marketing: true, analysis: false, technical: true });
  });

  it("'Aceptar todas' submits every section as on", async () => {
    const { onSubmit } = renderConsent();
    await userEvent.click(screen.getByRole("button", { name: "Aceptar todas" }));
    expect(onSubmit).toHaveBeenCalledWith({ marketing: true, analysis: true, technical: true });
  });

  it("rejectOptionalLabel submits only the required sections", async () => {
    const { onSubmit } = renderConsent({
      rejectOptionalLabel: "Rechazar opcionales",
      initial: { marketing: true, analysis: true },
    });
    await userEvent.click(screen.getByRole("button", { name: "Rechazar opcionales" }));
    expect(onSubmit).toHaveBeenCalledWith({ marketing: false, analysis: false, technical: true });
  });

  it("does not render the reject button without its label", () => {
    renderConsent();
    expect(screen.queryByRole("button", { name: "Rechazar opcionales" })).toBeNull();
  });

  it("respects the initial values", () => {
    renderConsent({ initial: { marketing: true, analysis: true } });
    expect(screen.getByRole("switch", { name: /Marketing/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("switch", { name: /Análisis/ })).toHaveAttribute("aria-checked", "true");
  });

  it("renders moreInfo", () => {
    renderConsent({ moreInfo: <a href="/cookies">Saber más</a> });
    expect(screen.getByRole("link", { name: "Saber más" })).toBeInTheDocument();
  });

  it("uses the custom button labels and required label", () => {
    renderConsent({
      acceptSelectionLabel: "Guardar",
      acceptAllLabel: "Todas",
      requiredLabel: "(Siempre)",
    });
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("button", { name: "Guardar" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Todas" })).toBeInTheDocument();
    expect(within(dialog).getByText("(Siempre)")).toBeInTheDocument();
  });
});
