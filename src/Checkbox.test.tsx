import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Checkbox from "./Checkbox.js";

describe("Checkbox", () => {
  it("associates the label with the checkbox", () => {
    render(<Checkbox label="Acepto los términos" />);
    expect(screen.getByLabelText("Acepto los términos")).toHaveAttribute("type", "checkbox");
  });

  it("respects an explicit id", () => {
    render(<Checkbox label="Acepto" id="acepto-x" />);
    expect(screen.getByLabelText("Acepto")).toHaveAttribute("id", "acepto-x");
  });

  it("aria-describedby points to the rendered hint and error, and aria-invalid on error", () => {
    const { rerender } = render(<Checkbox id="a" label="Acepto" hint="Obligatorio para continuar" />);
    const checkbox = screen.getByLabelText("Acepto");
    expect(checkbox).toHaveAttribute("aria-describedby", "a-hint");
    expect(checkbox).not.toHaveAttribute("aria-invalid");

    rerender(<Checkbox id="a" label="Acepto" hint="Obligatorio para continuar" error="Debes aceptar" />);
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAttribute("aria-describedby", "a-hint a-error");
    expect(screen.getByRole("alert")).toHaveTextContent("Debes aceptar");
  });

  it("mandatory adds the suffix and warning bar without setting required", () => {
    render(<Checkbox id="m" label="Acepto" mandatory />);
    const checkbox = screen.getByLabelText("Acepto (obligatorio)");
    expect(checkbox).not.toBeRequired();
    expect(checkbox.closest("label")).toHaveClass("border-l-ui-warning", "border-l-[3px]");
  });

  it("required sets the native required attribute", () => {
    render(<Checkbox label="Acepto" required />);
    expect(screen.getByLabelText(/Acepto/)).toBeRequired();
  });

  it("disabled disables the checkbox", () => {
    render(<Checkbox label="Acepto" disabled />);
    expect(screen.getByLabelText("Acepto")).toBeDisabled();
  });

  it("calls onChange and toggles when clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Acepto" onChange={onChange} />);
    const checkbox = screen.getByLabelText("Acepto");
    await user.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(checkbox).toBeChecked();
  });
});
