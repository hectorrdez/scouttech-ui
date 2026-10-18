import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Input from "./Input.js";
import { FieldError } from "./Field.js";
import { controlBorderClassName } from "./index.js";

describe("Input", () => {
  it("associates the label with the input", () => {
    render(<Input label="Correo" />);
    expect(screen.getByLabelText("Correo")).toBeInstanceOf(HTMLInputElement);
  });

  it("generates an id when none is given", () => {
    render(<Input label="Correo" />);
    const input = screen.getByLabelText("Correo");
    expect(input.id).not.toBe("");
  });

  it("respects an explicit id", () => {
    render(<Input label="Nombre" id="nombre-x" />);
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("id", "nombre-x");
  });

  it("sets aria-invalid only when there is an error", () => {
    const { rerender } = render(<Input label="Correo" />);
    expect(screen.getByLabelText("Correo")).not.toHaveAttribute("aria-invalid");

    rerender(<Input label="Correo" error="Obligatorio" />);
    expect(screen.getByLabelText("Correo")).toHaveAttribute("aria-invalid", "true");
  });

  it("aria-describedby points to the rendered hint and error only", () => {
    const { rerender } = render(<Input id="a" label="Correo" hint="Ej: a@b.es" />);
    const input = screen.getByLabelText("Correo");
    expect(input).toHaveAttribute("aria-describedby", "a-hint");
    expect(screen.getByText("Ej: a@b.es")).toHaveAttribute("id", "a-hint");

    rerender(<Input id="a" label="Correo" hint="Ej: a@b.es" error="Inválido" />);
    expect(input).toHaveAttribute("aria-describedby", "a-hint a-error");
    expect(screen.getByText("Inválido")).toHaveAttribute("id", "a-error");
  });

  it("merges a user aria-describedby", () => {
    render(<Input id="b" label="Clave" hint="Mínimo 8" aria-describedby="ext" />);
    expect(screen.getByLabelText("Clave")).toHaveAttribute("aria-describedby", "ext b-hint");
  });

  it("renders the error as role alert", () => {
    render(<Input id="c" label="Correo" error="Obligatorio" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Obligatorio");
  });

  it("mandatory adds the warning bar to the control without setting required", () => {
    render(<Input id="m" label="Nombre" mandatory />);
    const input = screen.getByLabelText("Nombre (obligatorio)");
    expect(input).toHaveClass("border-l-ui-warning", "border-l-[3px]");
    expect(input).not.toBeRequired();
    expect(input).not.toHaveAttribute("required");
    expect(input).not.toHaveAttribute("aria-required");
  });

  it("mandatory accessible name is the label plus the default suffix", () => {
    render(<Input id="n" label="Nombre" mandatory />);
    expect(screen.getByLabelText("Nombre (obligatorio)")).toBeInTheDocument();
  });

  it("mandatoryLabel replaces the default suffix", () => {
    render(<Input id="r" label="Nombre" mandatory mandatoryLabel=" (requerido)" />);
    expect(screen.getByLabelText("Nombre (requerido)")).toBeInTheDocument();
  });

  it("mandatory keeps the danger border and the warning bar when there is an error", () => {
    render(<Input id="e" label="Nombre" mandatory error="Completa este campo" />);
    const input = screen.getByLabelText("Nombre (obligatorio)");
    expect(input).toHaveClass("border-ui-danger", "border-l-ui-warning");
  });

  it("without mandatory there is no warning bar and no suffix", () => {
    render(<Input id="p" label="Nombre" />);
    const input = screen.getByLabelText("Nombre");
    expect(input).not.toHaveClass("border-l-ui-warning");
    expect(input).toHaveClass(...controlBorderClassName.split(" "));
  });

  it("FieldError renders role alert", () => {
    render(<FieldError>Algo falla</FieldError>);
    expect(screen.getByRole("alert")).toHaveTextContent("Algo falla");
  });
});
