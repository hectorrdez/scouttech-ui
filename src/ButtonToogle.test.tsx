import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import ButtonToogle, { ButtonToggle } from "./ButtonToogle.js";

function Controlled({ onChange }: { onChange: (value: boolean) => void }) {
  const [value, setValue] = useState(false);
  return (
    <ButtonToogle
      value={value}
      aria-label="Notificaciones"
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

describe("ButtonToogle", () => {
  it("has role switch and toggles aria-checked on click", async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    const toggle = screen.getByRole("switch", { name: "Notificaciones" });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it("toggles with the Space key", async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    const toggle = screen.getByRole("switch", { name: "Notificaciones" });

    await userEvent.tab();
    expect(toggle).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it("cantInteract sets aria-disabled and never calls onChange", async () => {
    const onChange = vi.fn();
    render(
      <ButtonToogle value aria-label="Cookies" cantInteract onChange={onChange} />,
    );
    const toggle = screen.getByRole("switch", { name: "Cookies" });
    expect(toggle).toHaveAttribute("aria-disabled", "true");
    expect(toggle).toHaveAttribute("aria-checked", "true");

    await userEvent.click(toggle);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ButtonToggle is an alias of ButtonToogle", () => {
    expect(ButtonToggle).toBe(ButtonToogle);
  });
});
