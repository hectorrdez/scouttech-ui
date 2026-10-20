import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import Modal from "./Modal.js";

describe("Modal", () => {
  it("is a modal dialog labelled by its title and focuses itself", () => {
    render(
      <Modal title="Nuevo socio" onClose={() => {}}>
        cuerpo
      </Modal>,
    );
    const dialog = screen.getByRole("dialog", { name: "Nuevo socio" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveFocus();
    expect(screen.getByRole("heading", { name: "Nuevo socio" })).toBeInTheDocument();
  });

  it("applies the size class", () => {
    const { rerender } = render(
      <Modal title="T" onClose={() => {}}>
        x
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toHaveClass("max-w-lg");
    rerender(
      <Modal title="T" size="sm" onClose={() => {}}>
        x
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toHaveClass("max-w-sm");
    rerender(
      <Modal title="T" size="lg" onClose={() => {}}>
        x
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toHaveClass("max-w-3xl");
  });

  it("closes on Escape, close button and scrim", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="T" onClose={onClose}>
        x
      </Modal>,
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    const [scrim, button] = screen.getAllByRole("button", { name: "Cerrar", hidden: true });
    await user.click(button!);
    expect(onClose).toHaveBeenCalledTimes(2);
    await user.click(scrim!);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("traps Tab and Shift+Tab inside the dialog", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>fuera</button>
        <Modal title="T" onClose={() => {}}>
          <input aria-label="uno" />
          <input aria-label="dos" />
        </Modal>
      </>,
    );
    await user.tab();
    expect(screen.getAllByRole("button", { name: "Cerrar" }).at(-1)).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText("uno")).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText("dos")).toHaveFocus();
    await user.tab();
    expect(screen.getAllByRole("button", { name: "Cerrar" }).at(-1)).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByLabelText("dos")).toHaveFocus();
  });

  it("returns focus to the trigger on unmount", async () => {
    const user = userEvent.setup();
    function Host() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>abrir</button>
          {open && (
            <Modal title="T" onClose={() => setOpen(false)}>
              x
            </Modal>
          )}
        </>
      );
    }
    render(<Host />);
    await user.click(screen.getByRole("button", { name: "abrir" }));
    expect(screen.getByRole("dialog")).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "abrir" })).toHaveFocus();
  });
});
