import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Button, { type ButtonVariant } from "./Button.js";

describe("Button", () => {
  it("renders type=button by default", () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: "Guardar" })).toHaveAttribute("type", "button");
  });

  it.each<ButtonVariant>(["primary", "secondary", "outline", "ghost", "danger", "danger-soft"])(
    "renders the %s variant",
    (variant) => {
      render(<Button variant={variant}>Acción</Button>);
      expect(screen.getByRole("button", { name: "Acción" })).toBeInTheDocument();
    },
  );

  it("danger-soft uses the soft danger surface with danger text and border", () => {
    render(<Button variant="danger-soft">Eliminar suave</Button>);
    const button = screen.getByRole("button", { name: "Eliminar suave" });
    expect(button).toHaveClass("bg-ui-danger-soft", "text-ui-danger", "border-ui-danger");
    expect(button).not.toHaveClass("bg-ui-danger");
  });

  it("disabled danger-soft drops the soft danger colours", () => {
    render(
      <Button variant="danger-soft" disabled>
        Eliminar suave
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Eliminar suave" });
    expect(button).toHaveClass("bg-ui-disabled", "text-ui-on-disabled");
    expect(button).not.toHaveClass("bg-ui-danger-soft");
  });

  it("loading sets aria-busy, disables and blocks clicks", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button loading onClick={onClick}>
        Enviando
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Enviando" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    expect(container.querySelector("svg.animate-spin")).not.toBeNull();

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders the icon before the label", () => {
    render(<Button icon={<span data-testid="icon" />}>Label</Button>);
    const button = screen.getByRole("button", { name: "Label" });
    const icon = screen.getByTestId("icon");
    expect(button.firstChild).toBe(icon);
    expect(button.lastChild).toHaveTextContent("Label");
  });

  it("can be focused with the keyboard", async () => {
    render(<Button>Foco</Button>);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Foco" })).toHaveFocus();
  });
});
