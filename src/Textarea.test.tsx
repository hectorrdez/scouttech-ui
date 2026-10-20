import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Textarea from "./Textarea.js";

describe("Textarea", () => {
  it("associates the label with the textarea", () => {
    render(<Textarea label="Comentario" />);
    expect(screen.getByLabelText("Comentario").tagName).toBe("TEXTAREA");
  });

  it("respects an explicit id", () => {
    render(<Textarea label="Notas" id="notas-x" />);
    expect(screen.getByLabelText("Notas")).toHaveAttribute("id", "notas-x");
  });

  it("aria-describedby points to the rendered hint and error, and aria-invalid on error", () => {
    const { rerender } = render(<Textarea id="a" label="Notas" hint="Máximo 200" />);
    const textarea = screen.getByLabelText("Notas");
    expect(textarea).toHaveAttribute("aria-describedby", "a-hint");
    expect(textarea).not.toHaveAttribute("aria-invalid");

    rerender(<Textarea id="a" label="Notas" hint="Máximo 200" error="Demasiado largo" />);
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAttribute("aria-describedby", "a-hint a-error");
    expect(screen.getByRole("alert")).toHaveTextContent("Demasiado largo");
  });

  it("mandatory adds the warning bar and the screen-reader suffix without setting required", () => {
    render(<Textarea id="m" label="Descripción" mandatory />);
    const textarea = screen.getByLabelText("Descripción (obligatorio)");
    expect(textarea).toHaveClass("border-l-ui-warning", "border-l-[3px]");
    expect(textarea).not.toBeRequired();
    expect(textarea).not.toHaveAttribute("aria-required");
  });

  it("required sets the native required attribute", () => {
    render(<Textarea id="r" label="Descripción" required />);
    expect(screen.getByLabelText(/Descripción/)).toBeRequired();
  });

  it("disabled disables the control", () => {
    render(<Textarea label="Notas" disabled />);
    expect(screen.getByLabelText("Notas")).toBeDisabled();
  });

  it("calls onChange when the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea label="Notas" onChange={onChange} />);
    await user.type(screen.getByLabelText("Notas"), "hola");
    expect(onChange).toHaveBeenCalledTimes(4);
  });
});
