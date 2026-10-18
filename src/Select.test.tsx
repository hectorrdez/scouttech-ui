import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Select from "./Select.js";

function Example(props: { error?: string; hint?: string; id?: string }) {
  return (
    <Select label="Curso" {...props}>
      <option value="1">Primero</option>
      <option value="2">Segundo</option>
    </Select>
  );
}

describe("Select", () => {
  it("associates the label with the select", () => {
    render(<Example />);
    expect(screen.getByLabelText("Curso").tagName).toBe("SELECT");
  });

  it("generates an id when none is given and respects an explicit one", () => {
    const { unmount } = render(<Example />);
    expect(screen.getByLabelText("Curso").id).not.toBe("");
    unmount();

    render(<Example id="curso-x" />);
    expect(screen.getByLabelText("Curso")).toHaveAttribute("id", "curso-x");
  });

  it("sets aria-invalid only with an error", () => {
    const { rerender } = render(<Example />);
    expect(screen.getByLabelText("Curso")).not.toHaveAttribute("aria-invalid");
    rerender(<Example error="Elige un curso" />);
    expect(screen.getByLabelText("Curso")).toHaveAttribute("aria-invalid", "true");
  });

  it("aria-describedby points to the hint and error elements", () => {
    render(<Example id="s" hint="Elige uno" error="Obligatorio" />);
    const select = screen.getByLabelText("Curso");
    expect(select).toHaveAttribute("aria-describedby", "s-hint s-error");
    expect(screen.getByText("Elige uno")).toHaveAttribute("id", "s-hint");
    expect(screen.getByRole("alert")).toHaveAttribute("id", "s-error");
  });

  it("mandatory adds the warning bar, is not required and has no aria-required", () => {
    render(
      <Select label="Rama" mandatory>
        <option value="a">A</option>
      </Select>,
    );
    const select = screen.getByLabelText("Rama (obligatorio)");
    expect(select).toHaveClass("border-l-ui-warning", "border-l-[3px]");
    expect(select).not.toBeRequired();
    expect(select).not.toHaveAttribute("aria-required");
  });

  it("mandatoryLabel customises the screen-reader suffix", () => {
    render(
      <Select label="Rama" mandatory mandatoryLabel=" (requerido)">
        <option value="a">A</option>
      </Select>,
    );
    expect(screen.getByLabelText("Rama (requerido)")).toBeInTheDocument();
  });

  it("mandatory keeps the danger border and the warning bar when there is an error", () => {
    render(
      <Select label="Rama" mandatory error="Elige una rama">
        <option value="">Sin elegir</option>
      </Select>,
    );
    const select = screen.getByLabelText("Rama (obligatorio)");
    expect(select).toHaveClass("border-ui-danger", "border-l-ui-warning");
  });

  it("omits aria-describedby when there is nothing to describe", () => {
    render(<Example />);
    expect(screen.getByLabelText("Curso")).not.toHaveAttribute("aria-describedby");
  });
});
