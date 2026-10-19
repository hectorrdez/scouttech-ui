import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StatCard from "./StatCard.js";

describe("StatCard", () => {
  it("renders label, value, description, delta, footer and footerMeta", () => {
    render(
      <StatCard
        label="Licencias en uso"
        value="128"
        description="Actualizado hoy"
        delta="+4,2 % mes"
        footer="Ver detalle"
        footerMeta="ID 042"
      />,
    );
    expect(screen.getByText("Licencias en uso")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByText("Actualizado hoy")).toBeInTheDocument();
    expect(screen.getByText("+4,2 % mes")).toBeInTheDocument();
    expect(screen.getByText("Ver detalle")).toBeInTheDocument();
    expect(screen.getByText("ID 042")).toBeInTheDocument();
  });

  it("puts testId on the card and the value on `${testId}-value`", () => {
    render(<StatCard testId="stat-licences" label="Licencias" value="128" />);
    expect(screen.getByTestId("stat-licences")).toBeInTheDocument();
    expect(screen.getByTestId("stat-licences-value")).toHaveTextContent("128");
  });

  it("renders the icon wrapper as aria-hidden", () => {
    render(<StatCard label="Usuarios" value="5" icon={<svg data-testid="icon" />} />);
    const wrapper = screen.getByTestId("icon").parentElement;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
  });

  it("renders no footer row when footer and footerMeta are absent", () => {
    const { container } = render(<StatCard label="Solo" value="1" />);
    expect(container.querySelector(".border-t")).toBeNull();
  });

  it("forwards the variant to the card", () => {
    render(<StatCard testId="tonal-stat" label="Tono" value="2" variant="tonal" />);
    const card = screen.getByTestId("tonal-stat");
    expect(card).toHaveAttribute("data-variant", "tonal");
    expect(card).toHaveClass("bg-ui-surface-tonal");
  });
});
